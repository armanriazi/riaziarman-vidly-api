const Joi = require("joi");
const { isOk, objOfResDbErrMsg, retObjSuccDbMsg } = require("../models/result");
const {db} = require("../startup/db");
const dbDebugger = require("debug")("app:db");
const PARTITION = "genres:";

const validateGenre = (genre) => {
  const schema = {
    id: Joi.string().min(3).max(25).required(),
    name: Joi.string().min(3).max(25).required(),
    title: Joi.string().min(3).max(25),
    active: Joi.bool(),
  };
  return Joi.validate(genre, schema);
};

const validateJustName = (genre) => {
  const schema = {
    name: Joi.string().min(3).max(25).required(),
  };
  return Joi.validate(genre, schema);
};

//Async Functions

const asyncDbListGenre = () =>
  new Promise((resolve, reject) => {
  
    resolve(
      db
        .list({ include_docs: true, partition: "genres" })
        .then((result) => {
          return result;
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetGenre = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .get(id)
        .then((result) => {
          return result;
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetGenreByName = (params) =>
  new Promise((resolve, reject) => {
    const qparams = { key: params.name, include_docs: "true" };
    resolve(
      db
        .partitionedView("genres", "query-by-name", "name", qparams)
        .then((result) => {
          return result;
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbAddGenre = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .insert({
          _id: id,
          _rev: params.rev,
          active: params.active,
          name: params.name,
          title: params.title,
          datetime: new Date(Date.now()).toUTCString(),
        })
        .then((body) => {
          return isOk(body);
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbRemoveGenre = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .destroy(id, params.rev)
        .then((body) => {
          return isOk(body);
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

exports.validate = validateGenre;
exports.validateJustName = validateJustName;
exports.asyncDbGetGenreByName = asyncDbGetGenreByName;
exports.asyncDbListGenre = asyncDbListGenre;
exports.asyncDbGetGenre = asyncDbGetGenre;
exports.asyncDbAddGenre = asyncDbAddGenre;
exports.asyncDbRemoveGenre = asyncDbRemoveGenre;

//Callback Functions
//const callbackDbAddGenre = (params, callback) => {
//   const id = PARTITION.concat(params.name);
//   db.insert({
//     _id: id,
//     _rev: params.rev,
//     active: params.active,
//     name: params.name,
//     title: params.title,
//     datetime: new Date(Date.now()).toUTCString(),
//   })
//     .then((body) => {
//       callback(isOk(body));
//     })
//     .catch(() => callback(objOfResDbErrMsg));
// };

// const callbackDbListGenre = (callback) => {
//   db.list({ include_docs: true, partition: "genres" })
//     .then((result) => {
//       callback(result);
//     })
//     .catch(() => callback(objOfResDbErrMsg));
// };

// const callbackDbGetGenre = (params, callback) => {
//   const id = PARTITION.concat(params.name);

//   db.get(id)
//     .then((result) => {
//       callback(result);
//     })
//     .catch(() => callback(objOfResDbErrMsg));
// };

// const callbackDbRemoveGenre = (params, callback) => {
//   const id = PARTITION.concat(params.name);
//   db.destroy(id, params.rev)
//     .then((body) => {
//       callback(isOk(body));
//     })
//     .catch(() => callback(objOfResDbErrMsg));
// };

// exports.callbackDbListGenre = callbackDbListGenre;
// exports.callbackDbGetGenre = callbackDbGetGenre;
// exports.callbackDbAddGenre = callbackDbAddGenre;
// exports.callbackDbRemoveGenre = callbackDbRemoveGenre;
