const Joi = require("joi");
const { isOk, objOfResDbErrMsg, retObjSuccDbMsg } = require("../models/result");
const {db} = require("../startup/db");
const PARTITION = "movies:";

const validateMovie = (movie) => {
  const schema = {
    id: Joi.string().min(5).max(25).required(),
    title: Joi.string().min(5).max(50).required(),
    name: Joi.string().min(3).max(25).required(),
    genreId: Joi.string().min(3).max(20).required(),
    numberInStock: Joi.number().min(0).required(),
    dailyRentalRate: Joi.number().min(0).required(),
  };
  return Joi.validate(movie, schema);
};
const validateJustName = (movie) => {
  const schema = {
    name: Joi.string().min(3).max(25).required(),
  };
  return Joi.validate(movie, schema);
};

//Async Functions
const asyncDbListMovie = () =>
  new Promise((resolve, reject) => {
    resolve(
      db
        .list({ include_docs: true, partition: "movies" })
        .then((result) => {
          return result;
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetMovieByName = (params) =>
  new Promise((resolve, reject) => {
    const qparams = { key: params.name, include_docs: "true" };
    resolve(
      db
        .partitionedView("movies", "query-by-name", "name", qparams)
        .then((result) => {
          return result;
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbGetMovie = (params) =>
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

const asyncDbUpdateNumberInStockMovie = (params) =>
  new Promise((resolve, reject) => {
    resolve(
      db
        .atomic("system", "numberinstock", params.id)
        .then((response) => {
          return isOk({ ok: response });
        })
        .catch(() => {
          return objOfResDbErrMsg;
        })
    );
  });

const asyncDbAddMovie = (params) =>
  new Promise((resolve, reject) => {
    const id = PARTITION.concat(params.id);
    resolve(
      db
        .insert({
          _id: id,
          _rev: params.rev,
          numberInStock: params.numberInStock,
          dailyRentalRate: params.dailyRentalRate,
          title: params.title,
          genreId: params.genreId,
          name: params.name,
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

const asyncDbRemoveMovie = (params) =>
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

exports.validate = validateMovie;
exports.validateJustName = validateJustName;
exports.asyncDbGetMovieByName = asyncDbGetMovieByName;
exports.asyncDbListMovie = asyncDbListMovie;
exports.asyncDbGetMovie = asyncDbGetMovie;
exports.asyncDbAddMovie = asyncDbAddMovie;
exports.asyncDbRemoveMovie = asyncDbRemoveMovie;
exports.asyncDbUpdateNumberInStockMovie = asyncDbUpdateNumberInStockMovie;
