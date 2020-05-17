const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {
  resErrMsg,
  resSuccMsg,
  retObjSuccDbMsg,
  isOk,
} = require("../models/result");
const dbGenres = require("../models/genre");
const express = require("express");
const winston = require("winston");
const router = express.Router();
const _ = require("underscore");

router.get("/", async (req, res) => {
  const genre = await dbGenres.asyncDbListGenre();
  if (genre != undefined && _.size(genre.rows) > 0) {
    res.json(retObjSuccDbMsg(genre));
    const doc = genre.rows[0].doc;
    if (doc._id.length <= 0) return resErrMsg(res, 404, "4042"); //Not found genre
  } else return resErrMsg(res, 404, "4042"); //Not found genres
});

router.get("/:id", async (req, res) => {
  const genre = await dbGenres.asyncDbGetGenre(req.params);
  if (genre._id !== undefined && genre._id.length > 0)
    res.json(retObjSuccDbMsg(genre));
  else return resErrMsg(res, 404, "4042"); //Not found genre
});

router.put("/", [auth, admin], async (req, res) => {
  const { error } = dbGenres.validate(req.body);
  if (error) return resErrMsg(res, 400, error.details[0].message);

  const genre = await dbGenres.asyncDbGetGenre(req.body);

  if (req.headers.rev !== undefined && req.headers.rev == "true")
    if (!genre._rev) return resErrMsg(res, 400, "4");
    //Please disable revison header
    else req.body.rev = genre._rev;

  const final = await dbGenres.asyncDbAddGenre(req.body);

  if (final !== undefined && final.success) res.json(final);
  else res.json(isOk({ body: { ok: false } }));
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const genre = await dbGenres.asyncDbGetGenre(req.params);
  params = Object.create({});
  if (req.headers.rev !== undefined) {
    if (req.headers.rev === genre._rev) {
      params.rev = req.headers.rev;
      params.id = req.params.id;
      params.name = req.params.name;
    } else return resErrMsg(res, 400, "44"); //Revison is not equal with database,please check your name
  } else return resErrMsg(res, 400, "-4"); //No provide revison

  const final = await dbGenres.asyncDbRemoveGenre(params);
  if (final !== undefined && final.success) res.json(final);
  else res.json(isOk({ body: { ok: false } }));
});

router.get("/name/:name", async (req, res) => {
  const { error } = dbGenres.validateJustName(req.params);
  if (error) return resErrMsg(res, 400, error.details[0].message);
  const gnr = await dbGenres.asyncDbGetGenreByName({ name: req.params.name });
  if ((gnr.rows && _.size(gnr.rows) > 0) || gnr.success) {
    const doc = gnr.rows[0].doc;
    if (doc._id.length == 0) return resErrMsg(res, 400, "4042");
    res.json(retObjSuccDbMsg(gnr.rows[0].doc));
  } else res.json(isOk({ body: { ok: false } }));
});

module.exports = router;

// function dbFindGenre(q, callback) {
//   db.find(q).then((result) => {
//     callback(result);
//   }).catch(()=> callback(0))
// }
// function dbPartFindGenre(q, callback) {
//   db.search(q).then((result) => {
//     callback(result);
//   });
// }
// function selector(params, fields) {
//   return {
//     selector: {
//       name: { $eq: params.name },
//     },
//     fields: [fields],
//   };
// }
// const q = selector(req.params, "name");
// dbFindGenre(q, (genre) => {
//   res.json(genre);
// });

//Object.fromEntries(params).name }
//new Map(Object.entries(params)
//map.set('1',obj)
// router.put("/:id", async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).json(error.details[0].message);

//   const genre = await Genre.findByIdAndUpdate(
//     req.params.id,
//     { name: req.body.name },
//     {
//       new: true,
//     }
//   );

//   if (!genre)
//     return res.status(404).json("The genre with the given ID was not found.");

//   res.json(genre);
// });

// router.delete("/:id", [auth, admin], async (req, res) => {
//   const genre = await Genre.findByIdAndRegnre(req.params.id);

//   if (!genre)
//     return res.status(404).json("The genre with the given ID was not found.");

//   res.json(genre);
// });

// router.get("/:id", async (req, res) => {
//   const genre = await Genre.findById(req.params.id);

//   if (!genre)
//     return res.status(404).json("The genre with the given ID was not found.");

//   res.json(genre);
// });
