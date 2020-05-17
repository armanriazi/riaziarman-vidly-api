
const {resErrMsg}=require("../models/result");

module.exports = function (req, res, next) { 
  // 401 Unauthorized
  // 403 Forbidden   
  if ((!req.header('isAdmin')) || (!req.header('isAdmin').includes("Il!@#"))) 
    resErrMsg(res,403,'Forbidden Access denied.');
    else next();
}
