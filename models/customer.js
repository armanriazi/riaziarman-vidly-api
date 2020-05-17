const Joi = require("joi");
const { isOk, objOfResDbErrMsg, retObjSuccDbMsg } = require("../models/result");
const {db} = require("../startup/db");
const PARTITION = "customers:";

const validateCustomer = (customer) => {
  const schema = {
    id: Joi.string().min(5).max(25).required(),
    name: Joi.string().min(5).max(25).required(),
    phone: Joi.string().min(5).max(15).required(),
    address: Joi.string().min(5).max(500),
    isGold: Joi.boolean(),
  };
  return Joi.validate(customer, schema);
};

const validateJustName = (customer) => {
  const schema = {
    name: Joi.string().min(3).max(25).required(),
  };
  return Joi.validate(customer, schema);
};

//Async Functions
const asyncDbListCustomer = () =>
  new Promise((resolve, reject) => {
    resolve(
      db
        .list({ include_docs: true, partition: "customers" })
        .then((result) => {
          return result;
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetCustomerByName = (params) =>
  new Promise((resolve, reject) => {
    const qparams = { key: params.name, include_docs: "true" };
    resolve(
      db
        .partitionedView("customers", "query-by-name", "name", qparams)
        .then((result) => {
          return result;
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetCustomer = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .get(id)
        .then((result) => {
          return result;
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbAddCustomer = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .insert({
          _id: id,
          _rev: params.rev,
          name: params.name,
          isGold: params.isGold,
          phone: params.phone,
          address: params.address,
          datetime: new Date(Date.now()).toUTCString(),
        })
        .then((body) => {
          return isOk(body);
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbRemoveCustomer = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .destroy(id, params.rev)
        .then((body) => {
          return isOk(body);
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

exports.validate = validateCustomer;
exports.validateJustName = validateJustName;
exports.asyncDbGetCustomerByName = asyncDbGetCustomerByName;
exports.asyncDbListCustomer = asyncDbListCustomer;
exports.asyncDbGetCustomer = asyncDbGetCustomer;
exports.asyncDbAddCustomer = asyncDbAddCustomer;
exports.asyncDbRemoveCustomer = asyncDbRemoveCustomer;
