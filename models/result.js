const isOk = (body) => {
  res = Object.create({});
  res.datetime = `${new Date(Date.now()).toUTCString()}`;
  if (body["ok"] === true) {
    res = body;
    res.message = "1";
    res.success = true;
  } else {
    res.message = "0";
    res.success = false;
  }
  return res;
};

const resErrMsg = (res, num, error) => {
  return res.status(num).json({
    success: false,
    message: error,
    datetime: `${new Date(Date.now()).toUTCString()}`,
  });
};
const resSuccMsg = (res, num, other) => {
  
  var resp = Object.create({});
    resp= other;
    resp.success= true;
    resp.message= "1";
    resp.datetime= `${new Date(Date.now()).toUTCString()}`;
    
  return res.status(num).json(resp);
};

const retObjSuccDbMsg = (other)=>{  
  var retp = Object.create({});
    retp= other;
    retp.success= true;
    retp.message= "1";
    retp.datetime= `${new Date(Date.now()).toUTCString()}`;    
  return retp;
};

exports.objOfResSuccMsg = {
  success: true,
  message: "",
  datetime: `${new Date(Date.now()).toUTCString()}`,
};
exports.objOfResDbSuccMsg = {
  success: true,
  message: "1",
  datetime: `${new Date(Date.now()).toUTCString()}`,
};
exports.objOfResDbErrMsg = {
  success: false,
  message: "0",
  datetime: `${new Date(Date.now()).toUTCString()}`,
};
exports.objOfResErrMsg = {
  success: false,
  message: "-1",
  datetime: `${new Date(Date.now()).toUTCString()}`,
};
exports.isOk = isOk;
exports.resErrMsg = resErrMsg;
exports.resSuccMsg = resSuccMsg;
exports.retObjSuccDbMsg=retObjSuccDbMsg;