const express = require("express");
const itemsRoutes = require("./itemsRoutes");

const app = express();

app.use(express.json());

app.use("/items", itemsRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.json({ error: err.message });
});

module.exports = app;