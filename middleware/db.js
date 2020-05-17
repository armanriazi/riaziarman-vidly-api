const nano = require("nano")("http://dbadmin:server7&@192.168.1.11:5984");
const winston = require("winston");

module.exports = (req, res, next) => {
  try {
    nano.db
      .get("dbvidly")
      .then((data) => {
        if (data.db_name === "dbvidly")
          winston.info("Successed-connected to the actived db");
        else winston.error("Failed-connected to the actived db");
      })
      .catch(() => {
        winston.warn("Not found db(-1)");
      });
    next();
  } catch (er) {
    winston.error("Invalid Connection to Db (400)");
  }
};



