const jwt = require("jsonwebtoken");
const config = require("config");
const Auth = require("../services/auth");
const {resErrMsg} = require("../models/result");


module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return  resErrMsg(res,401,"Access denied. No token provided.");

  try {
    jwt.verify(token, config.get("jwtPrivateKey"), function (err, decoded) {
        
      if (err && err.name === "TokenExpiredError") {
        resErrMsg(res,400,err.name);
      } else if (decoded !== undefined) {
        req.user = decoded;
        next();
      }else resErrMsg(res,400,"Invalid Token");  
    });
  } catch(er) {
    resErrMsg(res,400,"Invalid Token");    
  }
};

// auth.on("getedUserByEmail", (arg) => {
//     res.send(arg);
//   });
// module.exports.auth=auth;
