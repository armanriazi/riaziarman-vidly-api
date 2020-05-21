const jwt = require("jsonwebtoken");
const Joi = require("joi");
const _ = require("underscore");
const { db } = require("../startup/db");
const dbDebugger = require("debug")("app:db");
const Promise = require("bluebird");
const PARTITION = "users:";

const {
  isOk,
  objOfResErrMsg,
  objOfResDbErrMsg,
  retObjSuccDbMsg,
} = require("../models/result");

module.exports = {
  generateAuthTokenSign(refreshToken, doc, res, callback) {
    const user = { _id: doc._id, password: doc.password };
    const token = jwt.sign(user, process.env.JWT_PRIVATEKEY, {
      expiresIn: process.env.TOKENLIFE,
    });

    const response = Object.create({});
    if (refreshToken && refreshToken === doc.refreshToken) {
      Object.assign(
        response,
        retObjSuccDbMsg({
          token: token,
        })
      );
      callback(response);
    } else {
      const refreshToken = jwt.sign(
        user,
        process.env.REFRESHTOKEN_JWT_PRIVATEKEY,
        { expiresIn: process.env.REFRESH_TOKENLIFE }
      );
      doc.refreshToken = refreshToken;
      this.dbUpdateRefreshToken(doc, (result) => {
        if (result.success == true) {
          Object.assign(
            response,
            retObjSuccDbMsg({
              status: "Logged in",
              token: token,
              refreshToken: refreshToken,
            })
          );
        } else {
          Object.assign(response, objOfResDbErrMsg);
        }
        callback(response);
      });
    }
  },
  generateAuthTokenOfRefreshToken(refreshToken, doc, res, callback) {
    const user = { _id: doc._id, password: doc.password };
    const token = jwt.sign(user, process.env.JWT_PRIVATEKEY, {
      expiresIn: process.env.TOKENLIFE,
    });
    const response = Object.create({});
    if (refreshToken && refreshToken === doc.refreshToken) {
      Object.assign(
        response,
        retObjSuccDbMsg({
          token: token,
        })
      );
    } else {
      objOfResErrMsg.message = "Access denied.No refresh-token provided.";
      Object.assign(response, objOfResErrMsg);
    }
    callback(response);
  },
  dbUpdateRefreshToken(params, callback) {
    const id = PARTITION.concat(params.name);
    const rev = params._rev ? params._rev : params.rev;
    db.insert({
      _id: id,
      _rev: rev,
      email: params.email,
      active: params.active,
      name: params.name,
      password: params.password,
      refreshToken: params.refreshToken,
      datetime: new Date(Date.now()).toUTCString(),
    })
      .then((body) => {
        return body;
      })
      .then((final) => {
        callback(isOk(final));
      })
      .catch((er) => {
        dbDebugger(er);
        callback(objOfResDbErrMsg);
      });
  },

  dbAddUser(params, callback) {
    const id = PARTITION.concat(params.name);
    const rev = params._rev ? params._rev : params.rev;

    db.insert({
      _id: id,
      _rev: rev,
      email: params.email,
      active: params.active,
      name: params.name,
      password: params.password,
      refreshToken: params.refreshToken,
      datetime: new Date(Date.now()).toUTCString(),
    })
      .then((body) => {
        callback(isOk(body));
      })
      .catch((er) => {
        dbDebugger(er);
        callback(er);
      });
  },

  dbListUser(callback) {
    db.list({ include_docs: true, partition: "users" })
      .then((result) => {
        callback(result);
      })
      .catch((er) => {
        dbDebugger(er);
        callback(objOfResDbErrMsg);
      });
  },

  dbGetUser(params, callback) {
    const id = PARTITION.concat(params.name);
    db.get(id)
      .then((result) => {
        callback(result);
      })
      .catch((er) => {
        dbDebugger(er);
        callback(objOfResDbErrMsg);
      });
  },

  dbGetUserByEmail(params, callback) {
    const qparams = { key: params.email, include_docs: "true" };
    db.partitionedView("users", "query-users", "email", qparams)
      .then((result) => {
        callback(result);
      })
      .catch((er) => {
        dbDebugger(er);
        callback(objOfResDbErrMsg);
      });
  },
  validateJustEmail(user) {
    const schema = {
      email: Joi.string().min(5).max(255).required().email(),
    };
    return Joi.validate(user, schema);
  },
  validateUser(user) {
    const schema = {
      id: Joi.string().min(3).max(25).required(),
      name: Joi.string().min(3).max(50).required(),
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
    };

    return Joi.validate(user, schema);
  },
  validateUserLogin(user) {
    const schema = {
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
      refreshToken: Joi.string().min(25).max(500),
    };

    return Joi.validate(user, schema);
  },
};
