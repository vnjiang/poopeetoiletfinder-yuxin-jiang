process.env.GOOGLE_GEOCODING_API_KEY = "test-key";

const request = require("supertest");
const { buildTestApp } = require("./testApp");
const { connectTestMongo, clearTestMongo, closeTestMongo } = require("./setupMongo");
const Toilet = require("../../models/toilet");
const { makeToilet } = require("./factories");


const app = buildTestApp();

beforeAll(connectTestMongo);
afterAll(closeTestMongo);
beforeEach(clearTestMongo);

test("GET /api/toilets/fetch-toilets returns all toilets", async () => {
  await Toilet.create([
  makeToilet({ place_id: "p1", toilet_name: "A" }),
  makeToilet({ place_id: "p2", toilet_name: "B" }),
]);

  

  const res = await request(app).get("/api/toilets/fetch-toilets");
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(2);
});


test("GET /api/toilets/fetch-toilets - when db throws returns 500", async () => {
  const Toilet = require("../../models/toilet");
  jest.spyOn(Toilet, "find").mockRejectedValueOnce(new Error("db error"));

  const res = await request(app).get("/api/toilets/fetch-toilets");
  expect(res.status).toBe(500);

  Toilet.find.mockRestore();
});

