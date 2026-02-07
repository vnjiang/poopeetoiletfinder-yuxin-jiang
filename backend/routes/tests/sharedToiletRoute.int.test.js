process.env.GOOGLE_GEOCODING_API_KEY = "test-key";

jest.mock("axios", () => ({
  get: jest.fn(),
}));

const axios = require("axios");
const request = require("supertest");
const { buildTestApp } = require("./testApp");
const { connectTestMongo, clearTestMongo, closeTestMongo } = require("./setupMongo");
const SharedToilet = require("../../models/sharedToilet");
const { makeSharedToilet, pickEnum } = require("./factories");
const mongoose = require("mongoose");



const app = buildTestApp();

beforeAll(connectTestMongo);
afterAll(closeTestMongo);
beforeEach(async () => {
  await clearTestMongo();
  axios.get.mockReset();
});

describe("SharedToilet routes (integration)", () => {
  test("GET /api/shared-toilets returns pending list", async () => {
    await SharedToilet.create([
      makeSharedToilet({ toilet_name: "A", approved_by_admin: false, rejected: false }), 
      makeSharedToilet({ toilet_name: "B", approved_by_admin: true, rejected: false }),  
      makeSharedToilet({ toilet_name: "C", approved_by_admin: false, rejected: true }),  
    ]);

    const res = await request(app).get("/api/shared-toilets");
    expect(res.status).toBe(200);

    
    expect(res.body).toHaveLength(1);
    expect(res.body[0].toilet_name).toBe("A");
  });

  test("POST /api/shared-toilets will geocode eircode then save", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        status: "OK",
        results: [{ geometry: { location: { lat: 51.5, lng: -0.1 } } }],
      },
    });

    const typeVal = pickEnum(SharedToilet, "type");
    const priceVal = pickEnum(SharedToilet, "price");

    const payload = {
      toilet_name: "Shared 1",
      eircode: "T12X316",
      userId: "u1",
      type: typeVal,
      price: priceVal,
      contact_number: "123456789",
      created: new Date().toISOString(),
      approved_by_admin: false,
      rejected: false,
    };


    const res = await request(app).post("/api/shared-toilets").send(payload);
    expect(res.status).toBe(201);
    expect(res.body.toilet_name).toBe("Shared 1");
    expect(res.body.location).toBeTruthy();

  });

  test("GET /api/shared-toilets/user/:userId returns user toilets", async () => {
    await SharedToilet.create([
      makeSharedToilet({ toilet_name: "A", userId: "u1" }),
      makeSharedToilet({ toilet_name: "B", userId: "u1" }),
      makeSharedToilet({ toilet_name: "C", userId: "u2" }),
    ]);



    const res = await request(app).get("/api/shared-toilets/user/u1");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });


  test("POST /api/shared-toilets - geocode status != OK returns 400", async () => {
    axios.get.mockResolvedValueOnce({
      data: { status: "ZERO_RESULTS", results: [] },
    });

    const payload = {
      toilet_name: "Shared Bad",
      eircode: "INVALID",
      userId: "u1",
      type: pickEnum(SharedToilet, "type"),
      price: pickEnum(SharedToilet, "price"),
      contact_number: "123456789",
      created: new Date().toISOString(),
      approved_by_admin: false,
      rejected: false,
    };

    const res = await request(app).post("/api/shared-toilets").send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  test("POST /api/shared-toilets - geocode throws returns 400", async () => {
    axios.get.mockRejectedValueOnce(new Error("network error"));

    const payload = {
      toilet_name: "Shared Throw",
      eircode: "T12X316",
      userId: "u1",
      type: pickEnum(SharedToilet, "type"),
      price: pickEnum(SharedToilet, "price"),
      contact_number: "123456789",
      created: new Date().toISOString(),
      approved_by_admin: false,
      rejected: false,
    };

    const res = await request(app).post("/api/shared-toilets").send(payload);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });


  test("PUT /api/shared-toilets/reject/:id sets rejected=true", async () => {
    const doc = await SharedToilet.create(
      makeSharedToilet({ toilet_name: "R1", rejected: false, approved_by_admin: false })
    );

    const res = await request(app).put(`/api/shared-toilets/reject/${doc._id}`).send({});
    expect(res.status).toBe(200);
    expect(res.body.rejected).toBe(true);
  });



  test("DELETE /api/shared-toilets/:id deletes shared toilet", async () => {
    const doc = await SharedToilet.create(makeSharedToilet({ toilet_name: "D1" }));

    const res = await request(app).delete(`/api/shared-toilets/${doc._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "deleted successfully" });

    const stillThere = await SharedToilet.findById(doc._id);
    expect(stillThere).toBeNull();
  });



  test("PUT /api/shared-toilets/:id approves a pending toilet", async () => {
    const doc = await SharedToilet.create(
      makeSharedToilet({ toilet_name: "T1", approved_by_admin: false, rejected: false })
    );
  
    const res = await request(app)
      .put(`/api/shared-toilets/${doc._id}`)
      .send({ approved_by_admin: true, rejected: false });
  
    expect(res.status).toBe(200);
    expect(res.body.approved_by_admin).toBe(true);
    expect(res.body.rejected).toBe(false);
  });
  

  
  
test("PUT /api/shared-toilets/reject/:id rejects a toilet", async () => {
  const doc = await SharedToilet.create(
    makeSharedToilet({ toilet_name: "T2", approved_by_admin: false, rejected: false })
  );

  const res = await request(app).put(`/api/shared-toilets/reject/${doc._id}`).send({});

  expect(res.status).toBe(200);
  expect(res.body.rejected).toBe(true);
  expect(res.body.approved_by_admin).toBe(false);
});

test("PUT /api/shared-toilets/:id - not found => 404", async () => {
  const fakeId = new mongoose.Types.ObjectId().toString();
  const res = await request(app)
    .put(`/api/shared-toilets/${fakeId}`)
    .send({ approved_by_admin: true });

    expect(res.status).toBe(404);
});



test("PUT /api/shared-toilets/:id - when already approved, it resets approved_by_admin to false", async () => {
  const doc = await SharedToilet.create(
    makeSharedToilet({
      toilet_name: "Was Approved",
      approved_by_admin: true,  
      rejected: false,
      userId: "u1",
    })
  );

  const res = await request(app)
    .put(`/api/shared-toilets/${doc._id}`)
    .send({
      toilet_name: "After Edit",
  
    });

  expect(res.status).toBe(200);
  expect(res.body.toilet_name).toBe("After Edit");
  expect(res.body.approved_by_admin).toBe(false); 
});




test("DELETE /api/shared-toilets/:id deletes a toilet", async () => {
  const doc = await SharedToilet.create(makeSharedToilet({ toilet_name: "T3" }));

  const res = await request(app).delete(`/api/shared-toilets/${doc._id}`);

  expect(res.status).toBe(200);
  expect(res.body).toEqual({ message: "deleted successfully" });

  const after = await SharedToilet.findById(doc._id);
  expect(after).toBeNull();
});

test("DELETE /api/shared-toilets/:id - invalid id => 400", async () => {
  const res = await request(app).delete("/api/shared-toilets/not-a-valid-id");
  expect(res.status).toBe(400);
});


const Toilet = require("../../models/toilet");

test("GET /api/shared-toilets - db error => 500", async () => {
  jest.spyOn(SharedToilet, "find").mockRejectedValueOnce(new Error("db down"));

  const res = await request(app).get("/api/shared-toilets");
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty("message");
});

test("GET /api/shared-toilets/user/:userId - db error => 500", async () => {
  jest.spyOn(SharedToilet, "find").mockImplementationOnce(() => {
    return {
      sort: () => Promise.reject(new Error("db down")),
    };
  });

  const res = await request(app).get("/api/shared-toilets/user/u1");
  expect(res.status).toBe(500);
  expect(res.body).toHaveProperty("message");
});


test("PUT /api/shared-toilets/:id when approved creates/updates Toilet record", async () => {
  const doc = await SharedToilet.create(
    makeSharedToilet({
      toilet_name: "Approve Me",
      approved_by_admin: false,
      rejected: false,
      userId: "u1",
    })
  );



  const res = await request(app)
    .put(`/api/shared-toilets/${doc._id}`)
    .send({ approved_by_admin: true, rejected: false });

  expect(res.status).toBe(200);
  expect(res.body.approved_by_admin).toBe(true);

  const t = await Toilet.findOne({ place_id: doc._id.toString() });
  expect(t).toBeTruthy();
  expect(t.toilet_name).toBe("Approve Me");
});

test("DELETE /api/shared-toilets/:id when not found still returns 200 (covers sharedToilet falsy branch)", async () => {
  const fakeId = new mongoose.Types.ObjectId().toString();

  const res = await request(app).delete(`/api/shared-toilets/${fakeId}`);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ message: "deleted successfully" });
});

test("DELETE /api/shared-toilets/:id - db error => 400 (covers catch)", async () => {
  const id = new mongoose.Types.ObjectId().toString();

  jest
    .spyOn(SharedToilet, "findByIdAndDelete")
    .mockRejectedValueOnce(new Error("db down"));

  const res = await request(app).delete(`/api/shared-toilets/${id}`);

  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty("message");
  expect(res.body.message).toMatch(/db down/i);
});

test('POST /api/shared-toilets - normalizeEircode else branch (non-7 length) uses "T12"', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      status: "OK",
      results: [{ geometry: { location: { lat: 53.35, lng: -6.26 } } }],
    },
  });

  const payload = {
    toilet_name: "Norm Else",
    eircode: "  t12  ", 
    userId: "u1",
    type: pickEnum(SharedToilet, "type"),
    price: pickEnum(SharedToilet, "price"),
    contact_number: "123456789",
    created: new Date().toISOString(),
    approved_by_admin: false,
    rejected: false,
  };

  const res = await request(app).post("/api/shared-toilets").send(payload);

  expect(res.status).toBe(201);


  expect(axios.get).toHaveBeenCalledWith(
    "https://maps.googleapis.com/maps/api/geocode/json",
    expect.objectContaining({
      params: expect.objectContaining({
        address: "T12",
        key: "test-key",
      }),
    })
  );
});




});
