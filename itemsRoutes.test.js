process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("./app");
let items = require("./fakeDb");
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
    for (let item of testItems) {
      items.push(item);
    }
    const resp = await request(app).get("/items");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual(testItems);
  });

  afterEach(() => {
    items.length = 0;
  });
});

describe("tests adding item (with cleanup)", () => {
  test("can add an item when items is empty", async function() {
    const data = testItems[0];
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "added": data });
    expect(items.length).toEqual(1);
    expect(items[0]).toEqual(testItems[0]);
  });

  test("can add an item when items has an item", async function() {
    items.push(testItems[0]);
    const data = testItems[1];
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ "added": data });
    expect(items.length).toEqual(2);
    expect(items[0]).toEqual(testItems[0]);
    expect(items[1]).toEqual(testItems[1]);
  });

  test("can't add an item that's already been added", async function() {
    items.push(testItems[0]);
    const data = testItems[0];
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(400);
    expect(items.length).toEqual(1);
  });

  test("can't add an item if missing name", async function() {
    const price = testItems[0].price;
    const data = { price }
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(400);
    expect(items.length).toEqual(0);
  });

  test("can't add an item if missing price", async function() {
    const name = testItems[0].name;
    const data = { name }
    const resp = await request(app).post("/items").send(data);
    expect(resp.statusCode).toEqual(400);
    expect(items.length).toEqual(0);
  });

  afterEach(() => {
    items.length = 0;
  });
});

describe("tests getting 1 item (with cleanup)", () => {
  test("can get item", async function() {
    for (let item of testItems) {
      items.push(item);
    }
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
    for (let item of testItems) {
      items.push(item);
    }
    const name = "baditem";
    const resp = await request(app).get(`/items/${name}`);
    expect(resp.statusCode).toEqual(400);
  });

  afterEach(() => {
    items.length = 0;
  });
});

describe("tests modifying items (with cleanup)", () => {
  test("can modify items", async function() {
    for (let item of testItems) {
      items.push(item);
    }
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
    expect(items.length).toEqual(2);
    expect(items[0].name).toEqual(newName);
    // update price
    const data2 = { "price": newPrice }
    const resp2 = await request(app).patch(`/items/${newName}`).send(data2);
    expect(resp2.statusCode).toEqual(200);
    expect(resp2.body).toEqual(
      { "updated": { "name": newName, "price": newPrice } }
    );
    expect(items.length).toEqual(2);
    expect(items[0].price).toEqual(newPrice);
  });

  test("can't modify an item not in items", async function() {
    for (let item of testItems) {
      items.push(item);
    }
    const name = "baditem";
    const data = { "name": "newbaditem" };
    const resp = await request(app).patch(`/items/${name}`).send(data);
    expect(resp.statusCode).toEqual(400);
  });

  afterEach(() => {
    items.length = 0;
  });
});

describe("tests deleting items (with cleanup)", () => {
  test("can delete an item", async function() {
    for (let item of testItems) {
      items.push(item);
    }
    const name1 = testItems[0].name;
    const resp1 = await request(app).delete(`/items/${name1}`);
    expect(resp1.statusCode).toEqual(200);
    expect(resp1.body).toEqual({ message: "Deleted" });
    const name2 = testItems[1].name;
    const resp2 = await request(app).delete(`/items/${name2}`);
    expect(resp2.statusCode).toEqual(200);
    expect(resp2.body).toEqual({ message: "Deleted" });
  });

  test("can't delete an item not in items", async function() {
    for (let item of testItems) {
      items.push(item);
    }
    const name = "baditem";
    const resp = await request(app).delete(`/items/${name}`);
    expect(resp.statusCode).toEqual(400);
  });

  afterEach(() => {
    items.length = 0;
  });
});