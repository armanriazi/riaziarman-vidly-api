const Joi = require("joi");
const { isOk, objOfResDbErrMsg, retObjSuccDbMsg } = require("../models/result");
const {db} = require("../startup/db");
const dbDebugger = require("debug")("app:db");
const PARTITION = "rentals:";

const validateRental = (rental) => {
  const schema = {
    id: Joi.string().min(5).max(25).required(),
    customerId: Joi.string().min(5).max(25).required(),
    movieId: Joi.string().min(5).max(25).required(),
    name: Joi.string().min(5).max(25).required(),
    dateOut: Joi.date().required(),
    dateReturned: Joi.date(),
    rentalFee: Joi.number().min(5),
    description: Joi.string().min(5).max(500),
  };
  return Joi.validate(rental, schema);
};
const validateJustName = (rental) => {
  const schema = {
    name: Joi.string().min(3).max(25).required(),
  };
  return Joi.validate(rental, schema);
};

//Async Functions
const asyncDbListRental = () =>
  new Promise((resolve, reject) => {
    resolve(
      db
        .list({ include_docs: true, partition: "rentals" })
        .then((result) => {
          return result;
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetRentalByName = (params) =>
  new Promise((resolve, reject) => {
    const qparams = { key: params.name, include_docs: "true" };
    resolve(
      db
        .partitionedView("rentals", "query-by-name", "name", qparams)
        .then((result) => {
          return result;
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetRental = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .get(id)
        .then((result) => {
          return result;
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbAddRental = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .insert({
          _id: id,
          _rev: params.rev,
          customerId: params.customerId,
          name: params.name,
          movieId: params.movieId,
          dateOut: params.dateOut,
          dateReturned: params.dateReturned,
          rentalFee: params.rentalFee,
          datetime: new Date(Date.now()).toUTCString(),
        })
        .then((body) => {
          return isOk(body);
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbRemoveRental = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .destroy(id, params.rev)
        .then((body) => {
          return isOk(body);
        })
        .catch((er) => {
          dbDebugger(er);
          return objOfResDbErrMsg;
        })
    );
  });

exports.validate = validateRental;
exports.validateJustName = validateJustName;
exports.asyncDbGetRentalByName = asyncDbGetRentalByName;
exports.asyncDbListRental = asyncDbListRental;
exports.asyncDbGetRental = asyncDbGetRental;
exports.asyncDbAddRental = asyncDbAddRental;
exports.asyncDbRemoveRental = asyncDbRemoveRental;
