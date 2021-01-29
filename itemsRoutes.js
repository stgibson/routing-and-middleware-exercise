const express = require("express");
const ExpressError = require("./expressError");
const items = require("./fakeDb");

const router = new express.Router();

router.get("/", (req, res, next) => {
  return res.json(items);
});

module.exports = router;