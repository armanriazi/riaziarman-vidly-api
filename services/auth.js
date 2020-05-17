const Joi = require("joi");
const bcrypt = require("bcrypt");
const { isOk, resErrMsg } = require("../models/result");
const user = require("../models/user");
const _ = require("underscore");

const getUserByEmail = (body, res) => {
  const { error } = user.validateUserLogin(body);
  if (error) return resErrMsg(res, 400, error.details[0].message);  
  user.dbGetUserByEmail({ email: body.email }, async (usr) => {    
    if (usr.success !==undefined && !usr.success) return res.json( isOk({ body: { ok: false } }));
    if (usr.rows[0] !== undefined && _.size(usr.rows) == 1) {
      const doc = usr.rows[0].doc;

      if (doc._id.length == 0)
        return resErrMsg(res, 400, "Invalid email or password.(1)");
      const validPassword = await bcrypt.compare(body.password, doc.password);
      if (!validPassword)
        return resErrMsg(res, 400, "Invalid email or password.(2)");

      user.generateAuthTokenSign(body.refreshToken, doc, res, (token) => {
        res.json(token);
      });
    } else res.json(isOk({ body: { ok: false } }));
  });
};

const getTokenByRefreshToken = (req, res) => {
  const { error } = user.validateUserLogin(req.body);
  if (error) return resErrMsg(res, 400, error.details[0].message);
  const body = Object.create({});
  body.email = req.body.email;
  if (req.params.refreshToken && req.params.refreshToken.length > 0)
    body.refreshToken = req.params.refreshToken;

  user.dbGetUserByEmail({ email: body.email }, (usr) => {
    
    if (usr.success !==undefined && !usr.success) return res.json( isOk({ body: { ok: false } }));
    if (usr.rows[0] !== undefined && _.size(usr.rows) == 1) {
      const doc = usr.rows[0].doc;
      if (doc._id.length == 0) return resErrMsg(res, 400, "Not found user");            
      const token = user.generateAuthTokenOfRefreshToken(
        body.refreshToken,
        doc,
        res,
        (token) => {          
          res.json(token);
        }
      );
    } else {
      res.json(isOk({ body: { ok: false } }));
    }
  });
};

exports.getTokenByRefreshToken = getTokenByRefreshToken;
exports.getUserByEmail = getUserByEmail;
