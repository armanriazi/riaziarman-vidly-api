const winston = require("winston");
const { resErrMsg } = require("../models/result");

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug
  // silly
  resErrMsg(res, 500, "Something failed.");
};

/*

-1 = conflict rev of db
0 = not Ok of db for insert or delete

404 = Not found entity
4040 = Not found user
 40400 = user already registered
4041 = Not found customer
4042 = Not found genre
4043 = Not found movie
 40433 = Movie not in stock
4044 = Not found rental

4 = Please disable revison header
44 = Revison is not equal with database,please check your name
-4 = No provide revison

*/
