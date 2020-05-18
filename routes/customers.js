const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const dbCustomers = require("../models/customer");
const _ = require("underscore");
const {
  resErrMsg,
  resSuccMsg,
  retObjSuccDbMsg,
  isOk,
} = require("../models/result");

router.get("/",  async (req, res) => {
  const customer = await dbCustomers.asyncDbListCustomer();
  if (customer != undefined && _.size(customer.rows) > 0) {
    res.json(retObjSuccDbMsg(customer));
    const doc = customer.rows[0].doc;
    if (doc._id.length == 0) return resErrMsg(res, 404, "4041");
  } else return resErrMsg(res, 404, "4041");
});

router.get("/:id",  async (req, res) => {
  const customer = await dbCustomers.asyncDbGetCustomer(req.params);
  if (customer._id !== undefined && customer._id.length > 0)
    res.json(retObjSuccDbMsg(customer));
  else return resErrMsg(res, 404, "4041");
});

router.get("/name/:name",  async (req, res) => {
  const { error } = dbCustomers.validateJustName(req.params);
  if (error) return resErrMsg(res, 400, error.details[0].message);
  const ctm = await dbCustomers.asyncDbGetCustomerByName({
    name: req.params.name,
  });
  if ((ctm.rows && _.size(ctm.rows) > 0) || ctm.success) {
    const doc = ctm.rows[0].doc;
    if (doc._id.length == 0) return resErrMsg(res, 400, "4041");
    res.json(retObjSuccDbMsg(ctm.rows[0].doc));
  } else res.json(isOk({ body: { ok: false } }));
});

router.put("/", [auth, admin], async (req, res) => {
  const { error } = dbCustomers.validate(req.body);
  if (error) return resErrMsg(res, 400, error.details[0].message);

  const customer = await dbCustomers.asyncDbGetCustomer(req.body);

  if (req.headers.rev !== undefined && req.headers.rev == "true")
    if (!customer._rev) return resErrMsg(res, 400, "4");
    else req.body.rev = customer._rev;

  const final = await dbCustomers.asyncDbAddCustomer(req.body);

  if (final !== undefined && final.success) res.json(final);
  else res.json(isOk({ body: { ok: false } }));
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const customer = await dbCustomers.asyncDbGetCustomer(req.params);
  params = Object.create({});
  if (req.headers.rev !== undefined) {
    if (req.headers.rev === customer._rev) {
      params.rev = req.headers.rev;
      params.id = req.params.id;
    } else return resErrMsg(res, 400, "44");
  } else return resErrMsg(res, 400, "-4");

  const final = await dbCustomers.asyncDbRemoveCustomer(params);
  if (final !== undefined && final.success) res.json(final);
  else res.json(isOk({ body: { ok: false } }));
});

module.exports = router;
