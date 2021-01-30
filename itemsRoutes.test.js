process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
const fs = require("fs");
const PATH_TO_DB = "./fakeDb.json";
const testItems = [
  { "name": "popsicle", "price": 1.45 },
  { "name": "cheerios", "price": 3.40 }
]

describe("tests getting all items (with cleanup)", () => {
  test("get empty array if no items added", async function() {
    const resp = await request(app).get("/items");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual([]);
  });

  test("get list of items", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(testItems), "utf8");
    const resp = await request(app).get("/items");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(testItems);
  });

  afterEach(() => {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify([]), "utf8");
  });
});

describe("tests adding item (with cleanup)", () => {
  test("can add an item when items is empty", async function() {
    const data = testItems[0];
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "added": data });
    const items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(1);
    expect(items[0]).toEqual(testItems[0]);
  });

  test("can add an item when items has an item", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify([testItems[0]]), "utf8");
    const data = testItems[1];
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "added": data });
    const items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(2);
    expect(items[0]).toEqual(testItems[0]);
    expect(items[1]).toEqual(testItems[1]);
  });

  test("can't add an item that's already been added", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify([testItems[0]]), "utf8");
    const data = testItems[0];
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(400);
    const items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(1);
  });

  test("can't add an item if missing name", async function() {
    const price = testItems[0].price;
    const data = { price }
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(400);
    const items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(0);
  });

  test("can't add an item if missing price", async function() {
    const name = testItems[0].name;
    const data = { name }
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(400);
    const items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(0);
  });

  afterEach(() => {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify([]), "utf8");
  });
});

describe("tests getting 1 item (with cleanup)", () => {
  test("can get item", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(testItems), "utf8");
    let name1 = testItems[0].name;
    let name2 = testItems[1].name;
    let resp1 = await request(app).get(`/items/${name1}`);
    let resp2 = await request(app).get(`/items/${name2}`);
    expect(resp1.statusCode).toEqual(200);
    expect(resp1.body).toEqual(testItems[0]);
    expect(resp2.statusCode).toEqual(200);
    expect(resp2.body).toEqual(testItems[1]);
  });

  test("can't get item not in items", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(testItems), "utf8");
    const name = "baditem";
    const resp = await request(app).get(`/items/${name}`);
    expect(resp.statusCode).toEqual(400);
  });

  afterEach(() => {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify([]), "utf8");
  });
});

describe("tests modifying items (with cleanup)", () => {
  test("can modify items", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(testItems), "utf8");
    // update name
    const origName = "popsicle";
    const newName = "new popsicle";
    const origPrice = testItems[0].price;
    const newPrice = 2.45
    const data1 = { "name": newName }
    const resp1 = await request(app).patch(`/items/${origName}`).send(data1);
    expect(resp1.statusCode).toEqual(200);
    expect(resp1.body).toEqual(
      { "updated": { "name": newName, "price": origPrice } }
    );
    let items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(2);
    expect(items[0].name).toEqual(newName);
    // update price
    const data2 = { "price": newPrice }
    const resp2 = await request(app).patch(`/items/${newName}`).send(data2);
    expect(resp2.statusCode).toEqual(200);
    expect(resp2.body).toEqual(
      { "updated": { "name": newName, "price": newPrice } }
    );
    items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(2);
    expect(items[0].price).toEqual(newPrice);
  });

  test("can't modify an item not in items", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(testItems), "utf8");
    const name = "baditem";
    const data = { "name": "newbaditem" };
    const resp = await request(app).patch(`/items/${name}`).send(data);
    expect(resp.statusCode).toEqual(400);
  });

  afterEach(() => {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify([]), "utf8");
  });
});

describe("tests deleting items (with cleanup)", () => {
  test("can delete an item", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(testItems), "utf8");
    const name1 = testItems[0].name;
    const resp1 = await request(app).delete(`/items/${name1}`);
    expect(resp1.statusCode).toEqual(200);
    expect(resp1.body).toEqual({ message: "Deleted" });
    let items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(1);
    const name2 = testItems[1].name;
    const resp2 = await request(app).delete(`/items/${name2}`);
    expect(resp2.statusCode).toEqual(200);
    expect(resp2.body).toEqual({ message: "Deleted" });
    items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(0);
  });

  test("can't delete an item not in items", async function() {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify(testItems), "utf8");
    const name = "baditem";
    const resp = await request(app).delete(`/items/${name}`);
    expect(resp.statusCode).toEqual(400);
    let items = JSON.parse(fs.readFileSync(PATH_TO_DB, "utf8"));
    expect(items.length).toEqual(2);
  });

  afterEach(() => {
    fs.writeFileSync(PATH_TO_DB, JSON.stringify([]), "utf8");
  });
});