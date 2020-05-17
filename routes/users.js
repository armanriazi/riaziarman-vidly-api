const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const {
  resErrMsg,
  objOfResDbErrMsg,
  resSuccMsg,
  retObjSuccDbMsg,
  isOk,
} = require("../models/result");
const user = require("../models/user");
const PARTITION = "users:";
// router.get('/me', auth, async (req, res) => {
//   const user = await user.findById(req.user._id).select('-password');
//   res.send(user);
// });

router.get("/", (req, res) => {
  user.dbListUser((usr) => {
    res.json(usr);
  });
});

router.get("/:email", async (req, res) => {
  const { error } = user.validateJustEmail(req.params);
  if (error) return resErrMsg(res, 400, error.details[0].message);
  user.dbGetUserByEmail({ email: req.params.email }, (usr) => {
        
    if ((usr.rows && _.size(usr.rows) > 0) || usr.success) {
      const doc = usr.rows[0].doc;      
      if (doc._id.length == 0) return resErrMsg(res, 400, "4040");
      var picked = _.pick(usr.rows[0].doc, ["name", "email", "refreshToken"]);
      res.json(retObjSuccDbMsg(picked));
    } else res.json(isOk({ body: { ok: false } }));
  });
});

router.post("/", async (req, res) => {
  const { error } = user.validateUser(req.body);
  if (error) return resErrMsg(res, 400, error.details[0].message);
  user.dbGetUser({ name: req.body.name }, (u) => {
    if (u.success) return resErrMsg(res, 400, "40400");
  });
  var picked = _.pick(req.body, ["name", "email", "password"]);
  const salt = await bcrypt.genSalt(10);
  var newuser = Object.create({});
  newuser.name = picked.name;
  newuser.email = picked.email;
  newuser.active = true;
  newuser.password = await bcrypt.hash(picked.password, salt);
  newuser._id = PARTITION.concat(newuser.name);
  newuser.refreshToken = jwt.sign(
    user,
    config.get("refreshTokenJwtPrivateKey"),
    { expiresIn: config.get("refreshTokenLife") }
  );
 
  user.dbAddUser(
    {
      email: newuser.email,
      password: newuser.password,
      name: newuser.name,
      active: newuser.active,
      refreshToken: newuser.refreshToken
    },
    (usr) => {
      if (usr == -1) res.json(objOfResDbErrMsg);
      res.header("x-auth-token", usr.token);
      res.header("x-auth-refresh-token", usr.refreshToken).send(usr);
    }
  );
});

module.exports = router;
