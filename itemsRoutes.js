const express = require("express");
const ExpressError = require("./expressError");
const fs = require("fs");

const PATH_TO_DB = "./fakeDb.json";

const router = new express.Router();

router.get("/", (req, res, next) => {
  let data;
  try {
    data = fs.readFileSync(PATH_TO_DB, "utf8");
  }
  catch(err) {
    const expressError = new
      ExpressError("Couldn't read database", 500);
    return next(expressError);
  }
  const items = JSON.parse(data);
  return res.json(items);
});

router.post("/", (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    const expressError = new
      ExpressError("Both name and price are required", 400);
    return next(expressError);
  }
  const name = req.body.name;
  let data;
  try {
    data = fs.readFileSync(PATH_TO_DB, "utf8");
  }
  catch(err) {
    const expressError = new ExpressError("Couldn't read database", 500);
    return next(expressError);
  }
  const items = JSON.parse(data);
  if (items.find(item => item.name === name)) {
    const expressError = new
      ExpressError("That item has already been added", 400);
    return next(expressError);
  }
  const price = req.body.price;
  const newItem = { name, price };
  items.push(newItem);
  try {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(items), "utf8");
  }
  catch(err) {
    const expressError = new ExpressError("Couldn't write to database", 500);
    return next(expressError);
  }
  return res.json({ "added": newItem });
});

router.get("/:name", (req, res, next) => {
  const name = req.params.name;
  let data;
  try {
    data = fs.readFileSync(PATH_TO_DB, "utf8");
  }
  catch(err) {
    const expressError = new ExpressError("Couldn't read database", 500);
    return next(expressError);
  }
  const items = JSON.parse(data);
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
  let data;
  try {
    data = fs.readFileSync(PATH_TO_DB, "utf8");
  }
  catch(err) {
    const expressError = new ExpressError("Couldn't read database", 500);
    return next(expressError);
  }
  const items = JSON.parse(data);
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
  try {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(items), "utf8");
  }
  catch(err) {
    const expressError = new ExpressError("Couldn't write to database", 500);
    return next(expressError);
  }
  return res.json({ "updated": item });
});

router.delete("/:name", (req, res, next) => {
  const name = req.params.name;
  let data;
  try {
    data = fs.readFileSync(PATH_TO_DB, "utf8");
  }
  catch(err) {
    const expressError = new ExpressError("Couldn't read database", 500);
    return next(expressError);
  }
  let items = JSON.parse(data);
  const itemIndex = items.findIndex(item => item.name === name);
  if (itemIndex === -1) {
    const expressError = new
      ExpressError(`${name} was not found in items`, 400);
    return next(expressError);
  }
  items = items.filter(item => item.name !== name);
  try {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(items), "utf8");
  }
  catch(err) {
    const expressError = new ExpressError("Couldn't write to database", 500);
    return next(expressError);
  }
  return res.json({ message: "Deleted" });
});

module.exports = router;