const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const dbMovies = require("../models/movie");
const dbGenres = require("../models/genre");
const _ = require("underscore");
const {
  resErrMsg,
  resSuccMsg,
  retObjSuccDbMsg,
  isOk,
} = require("../models/result");

router.get("/", async (req, res) => {
  const movie = await dbMovies.asyncDbListMovie();
  if (movie != undefined && _.size(movie.rows) > 0) {
    res.json(retObjSuccDbMsg(movie));
    const doc = movie.rows[0].doc;
    if (doc._id.length == 0) return resErrMsg(res, 404, "4043");
  } else return resErrMsg(res, 404, "4043");
});

router.get("/:id", async (req, res) => {
  const movie = await dbMovies.asyncDbGetMovie(req.params);
  if (movie._id !== undefined && movie._id.length > 0)
    res.json(retObjSuccDbMsg(movie));
  else return resErrMsg(res, 404, "4043");
});

router.get("/name/:name", async (req, res) => {
  const { error } = dbMovies.validateJustName(req.params);
  if (error) return resErrMsg(res, 400, error.details[0].message);
  const mov = await dbMovies.asyncDbGetMovieByName({ name: req.params.name });
  if ((mov.rows && _.size(mov.rows) > 0) || mov.success) {
    const doc = mov.rows[0].doc;
    if (doc._id.length == 0) return resErrMsg(res, 400, "4043");
    res.json(retObjSuccDbMsg(mov.rows[0].doc));
  } else res.json(isOk({ body: { ok: false } }));
});

router.put("/", [auth, admin], async (req, res) => {
  const { error } = dbMovies.validate(req.body);
  if (error) return resErrMsg(res, 400, error.details[0].message);

  const genre = await dbGenres.asyncDbGetGenre({ id: req.body.genreId });
  if (genre.success == false || (genre._id && genre._id.length == 0))
    return resErrMsg(res, 404, "4043");
  else req.body.genreId = "genres:".concat(req.body.genreId);

  const movie = await dbMovies.asyncDbGetMovie(req.body);

  if (req.headers.rev !== undefined && req.headers.rev == "true")
    if (!movie._rev) return resErrMsg(res, 400, "4");
    else req.body.rev = movie._rev;

  const final = await dbMovies.asyncDbAddMovie(req.body);

  if (final !== undefined && final.success) res.json(final);
  else res.json(isOk({ body: { ok: false } }));
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const movie = await dbMovies.asyncDbGetMovie(req.params);
  params = Object.create({});
  if (req.headers.rev !== undefined) {
    if (req.headers.rev === movie._rev) {
      params.rev = req.headers.rev;
      params.id = req.params.id;
      params.name = req.params.name;
    } else return resErrMsg(res, 400, "44");
  } else return resErrMsg(res, 400, "-4");

  const final = await dbMovies.asyncDbRemoveMovie(params);
  if (final !== undefined && final.success) res.json(final);
  else res.json(isOk({ body: { ok: false } }));
});

module.exports = router;
