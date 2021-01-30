const express = require("express");
const ExpressError = require("./expressError");
let items = require("./fakeDb");

const router = new express.Router();

router.get("/", (req, res, next) => {
  return res.json(items);
});

router.post("/", (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    const expressError = new
      ExpressError("Both name and price are required", 400);
    return next(expressError);
  }
  const name = req.body.name;
  if (items.find(item => item.name === name)) {
    const expressError = new
      ExpressError("That item has already been added", 400);
    return next(expressError);
  }
  const price = req.body.price;
  const newItem = { name, price };
  items.push(newItem);
  return res.json({ "added": newItem });
});

router.get("/:name", (req, res, next) => {
  const name = req.params.name;
  const item = items.find(item => item.name === name);
  if (!item) {
    const expressError = new
      ExpressError(`${name} was not found in items`, 400);
    return next(expressError);
  }
  return res.json(item);
});

router.patch("/:name", (req, res, next) => {
  if (!req.body.name && !req.body.price) {
    const expressError = new
      ExpressError("Eiter name or price is required", 400);
    return next(expressError);
  }
  const origName = req.params.name;
  const item = items.find(item => item.name === origName);
  if (!item) {
    const expressError = new
      ExpressError(`${origName} was not found in items`, 400);
    return next(expressError);
  }
  const newName = req.body.name;
  const newPrice = req.body.price;
  if (newName) {
    item.name = newName;
  }
  if (newPrice) {
    item.price = newPrice;
  }
  return res.json({ "updated": item });
});

router.delete("/:name", (req, res, next) => {
  const name = req.params.name;
  const item = items.findIndex(item => item.name === name);
  if (item === -1) {
    const expressError = new
      ExpressError(`${name} was not found in items`, 400);
    return next(expressError);
  }
  items = items.filter(item => item.name !== name)
  return res.json({ message: "Deleted" });
});

module.exports = router;