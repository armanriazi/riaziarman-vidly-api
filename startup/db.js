const agentkeepalive = require("agentkeepalive");
const winston = require("winston");
const dbDebugger = require("debug")("app:db");

const myagent = new agentkeepalive({
  maxSockets: 100,
  maxKeepAliveRequests: 0,
  maxKeepAliveTime: 30000,
});

const opt_prod = {
  url: "",
  parseUrl: false,
  requestDefaults: {
    agent: myagent,
    // "proxy" : "http://someproxy"
  },
};
const opt_dev = {
  url: "",
  parseUrl: false,
  // log: (id, args) => {
  //   console.log(id, args);
  // },
};

const result = {};

if (process.env.NODE_VIDLY_ENV == "production") {
  opt_prod.url =
    "http://dbadmin:server7&@192.168.1.11:5984";
  result.nano = require("nano")(opt_prod);
  exports.db = require("nano")(opt_prod).use("dbvidly");
} else if (process.env.NODE_VIDLY_ENV == "development") {
  opt_dev.url = "http://dbadmin:server7&@192.168.1.11:5984";
  result.nano = require("nano")(opt_dev);
  exports.db = require("nano")(opt_dev).use("dbvidly");
}

exports.createDb = function () {
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
