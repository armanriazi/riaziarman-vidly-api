const agentkeepalive = require("agentkeepalive");
const winston = require("winston");
const dbDebugger = require("debug")("app:db");
const Cloudant = require("@cloudant/cloudant");
const myagent = new agentkeepalive({
  maxSockets: 100,
  maxKeepAliveRequests: 0,
  maxKeepAliveTime: 30000,
});
//production
try {
  const username = process.env.IBM_USERNAME_KEY_WRITER;
  const password = process.env.IBM_USER_PASS_WRITER;
  const url = process.env.IBM_URL_WRITER;

  const productionConnectionString = {
    url: url,
    username: username,
    password: password,
  };

  const cloudant = Cloudant(productionConnectionString);
} catch (er) {
  dbDebugger(er);
  winston.warn(
    "Your are not in production mode and If you want it please change and set environment to production"
  );
}
const result = {};
const opt_dev = {
  url: "",
  parseUrl: false,
  agent: myagent,
  // log: (id, args) => {
  //   console.log(id, args);
  // },
};

if (process.env.NODE_ENV == "production") {
  result.nano = cloudant.db;
  exports.db = cloudant.db.use("dbvidly");
} else if (process.env.NODE_ENV == "development") {
  opt_dev.url = "http://dbadmin:server7&@192.168.1.11:5984";
  result.nano = require("nano")(opt_dev);
  exports.db = require("nano")(opt_dev).use("dbvidly");
} else {
  //stage- reader
  const sUserName = "apikey-bf77340ea0f44183ba8eb7a7945ff364";
  const sPassword = "287c4cab62a858eca8569d1edb9fa2c3d337b5e3";
  const sUrl = `https://${sUserName}:${sPassword}@1ea70936-0600-4e1a-8ac6-8069a58fe0d2-bluemix.cloudantnosqldb.appdomain.cloud`;

  const stageConnectionString = {
    url: sUrl,
    username: sUserName,
    password: sPassword,
  };

  const cloudant = Cloudant(stageConnectionString);
  result.nano = cloudant.db;
  exports.db = cloudant.db.use("dbvidly");
}

exports.createDb = function () {
  if (result.nano.db != undefined)
    result.nano.db
      .create("dbvidly", { partitioned: true })
      .then((data) => {
        winston.info("Connected to db...");
      })
      .catch((er) => {
        dbDebugger(er);
        winston.warn("Database is exist");
      });
};

// const myagent = new agentkeepalive({
//   maxSockets: 100,
//   maxKeepAliveRequests: 0,
//   maxKeepAliveTime: 30000,
// });

// const opt_prod = {
//   url: "",
//   parseUrl: false,
//   requestDefaults: {
//     agent: myagent,
//     // "proxy" : "http://someproxy"
//   },
// };

//const Auth = require("../services/auth");
// ////Subscribe-exposes (addListener=on)
// const loginHandler = (auth, res) => {
//   auth.on("getedUserByEmail", (arg) => {

//   });
// };
// const generateTokenHandler = (auth, res) => {
//   auth.on("getedTokenByRefreshToken", (arg) => {
//      //Logging
//   });
// };
// exports.loginHandler = loginHandler;
// exports.generateTokenHandler = generateTokenHandler;

//const EventEmitter = require("events");

// class DbUrl extends EventEmitter {
//   selectUrl(mess) {
//     console.log(mess);
//     const dburl = "http://dbadmin:server7&@192.168.1.11:5984";
//     console.log(dburl);
//     this.emit("selectedUrl", dburl);
//   }
// }
// module.exports = DbUrl;

//exports.db = nano.db.use("dbvidly");

//module.exports = nano;
/*
nano.db.get("dbvidly",  (res, req)=> {
      const { error } = validate(req.body);
      if (error) {
        res.status(error.statusCode);
        return res.send(error.message);
      }
      res.status(200);
      res.send(res.body);
    });
*/
