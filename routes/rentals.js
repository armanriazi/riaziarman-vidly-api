const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const dbRentals = require("../models/rental");
const dbMovies = require("../models/movie");
const dbCustomer = require("../models/customer");
const _ = require("underscore");
const {
  resErrMsg,
  resSuccMsg,
  retObjSuccDbMsg,
  isOk,
} = require("../models/result");

router.get("/", async (req, res) => {
  const rental = await dbRentals.asyncDbListRental();
  if (rental != undefined && _.size(rental.rows) > 0) {
    res.json(retObjSuccDbMsg(rental));
    const doc = rental.rows[0].doc;
    if (doc._id.length == 0) return resErrMsg(res, 404, "4044");
  } else return resErrMsg(res, 404, "4044");
});

router.get("/:id", async (req, res) => {
  const rental = await dbRentals.asyncDbGetRental(req.params);
  if (rental._id !== undefined && rental._id.length > 0)
    res.json(retObjSuccDbMsg(rental));
  else return resErrMsg(res, 404, "4044");
});

router.get("/name/:name", async (req, res) => {
  const { error } = dbRentals.validateJustName(req.params);
  if (error) return resErrMsg(res, 400, error.details[0].message);
  const rnl = await dbRentals.asyncDbGetRentalByName({ name: req.params.name });
  if ((rnl.rows && _.size(rnl.rows) > 0) || rnl.success) {
    const doc = rnl.rows[0].doc;
    if (doc._id.length == 0) return resErrMsg(res, 400, "4044");
    res.json(retObjSuccDbMsg(rnl.rows[0].doc));
  } else res.json(isOk({ body: { ok: false } }));
});

router.put("/", [auth], async (req, res) => {
  const { error } = dbRentals.validate(req.body);
  if (error) return resErrMsg(res, 400, error.details[0].message);

  const movie = await dbMovies.asyncDbGetMovie({ id: req.body.movieId });
  if (movie.numberInStock === 0) return resErrMsg(res, 400, "40433");
  if (movie.success == false || (movie._id && movie._id.length == 0))
    return resErrMsg(res, 404, "4043");
  else req.body.movieId = "movies:".concat(req.body.movieId);

  const customer = await dbCustomer.asyncDbGetCustomer({
    id: req.body.customerId,
  });
  if (customer.success == false || (customer._id && customer._id.length == 0))
    return resErrMsg(res, 404, "4041");
  else req.body.customerId = "customers:".concat(req.body.customerId);

  const rental = await dbRentals.asyncDbGetRental(req.body);
  if (req.headers.rev !== undefined && req.headers.rev == "true")
    if (!rental._rev) return resErrMsg(res, 400, "4");
    else req.body.rev = rental._rev;

  const finalUpdateNumberInStockMovie = await dbMovies.asyncDbUpdateNumberInStockMovie(
    { id: `${movie._id}` }
  );
  if (
    finalUpdateNumberInStockMovie !== undefined &&
    finalUpdateNumberInStockMovie.success
  ) {
    const final = await dbRentals.asyncDbAddRental(req.body);
    if (final !== undefined && final.success) res.json(final);
    else res.json(isOk({ body: { ok: false } }));
  } else res.json(isOk({ body: { ok: false } }));
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const rental = await dbRentals.asyncDbGetRental(req.params);  
  params = Object.create({});
  if (req.headers.rev !== undefined) {
    if (req.headers.rev === rental._rev) {
      params.rev = req.headers.rev;
      params.id = req.params.id;
    } else return resErrMsg(res, 400, "44");
  } else return resErrMsg(res, 400, "-4");

  const final = await dbRentals.asyncDbRemoveRental(params);
  if (final !== undefined && final.success) res.json(final);
  else res.json(isOk({ body: { ok: false } }));
});

module.exports = router;
