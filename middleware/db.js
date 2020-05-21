const { db } = require("../startup/db");
const winston = require("winston");

module.exports = (req, res, next) => {
  try {
    db.get("dbvidly")
      .then((data) => {
        if (data.db_name == process.env.DBNAME)
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
