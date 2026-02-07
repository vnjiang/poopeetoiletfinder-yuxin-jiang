process.env.GOOGLE_GEOCODING_API_KEY = "test-key";

const request = require("supertest");
const { buildTestApp } = require("./testApp");
const { connectTestMongo, clearTestMongo, closeTestMongo } = require("./setupMongo");

const Review = require("../../models/review");
const Toilet = require("../../models/toilet");
const { makeToilet } = require("./factories");

const mongoose = require("mongoose");
const app = buildTestApp();

beforeAll(connectTestMongo);
afterAll(closeTestMongo);
beforeEach(clearTestMongo);

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Review routes (integration)", () => {
  test("GET /api/reviews health check", async () => {
    const res = await request(app).get("/api/reviews");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Review Route Working!" });
  });

  describe("POST /api/reviews/ratings-batch", () => {
    test("placeIds must be array => 400", async () => {
      const res = await request(app)
        .post("/api/reviews/ratings-batch")
        .send({ placeIds: "not-array" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/placeIds must be an array/i);
    });

    test(">500 => 413", async () => {
      const big = Array.from({ length: 501 }, (_, i) => `p${i}`);
      const res = await request(app)
        .post("/api/reviews/ratings-batch")
        .send({ placeIds: big });

      expect(res.status).toBe(413);
      expect(res.body.message).toMatch(/too many placeIds/i);
    });

    test("returns map with defaults", async () => {
      await Review.create([
        { review_id: "r1", place_id: "p1", user_id: "u1", user_name: "A", rating: 4, comment: "ok", created_date: new Date() },
        { review_id: "r2", place_id: "p1", user_id: "u2", user_name: "B", rating: 2, comment: "meh", created_date: new Date() },
        { review_id: "r3", place_id: "p2", user_id: "u3", user_name: "C", rating: 5, comment: "great", created_date: new Date() },
      ]);

      const res = await request(app)
        .post("/api/reviews/ratings-batch")
        .send({ placeIds: ["p1", "p2", "p3"] });

      expect(res.status).toBe(200);
      expect(res.body.p1.reviewCount).toBe(2);
      expect(res.body.p2.reviewCount).toBe(1);
      expect(res.body.p3).toEqual({ averageRating: 0, reviewCount: 0 });
    });

    test("dedupe + filter blanks", async () => {
      await Review.create([
        { review_id: "r1", place_id: "p1", user_id: "u1", user_name: "A", rating: 4, comment: "ok", created_date: new Date() },
      ]);

      const res = await request(app)
        .post("/api/reviews/ratings-batch")
        .send({ placeIds: ["p1", "p1", "", "p2"] });

      expect(res.status).toBe(200);
      expect(Object.keys(res.body).sort()).toEqual(["p1", "p2"]);
      expect(res.body.p1.reviewCount).toBe(1);
      expect(res.body.p2).toEqual({ averageRating: 0, reviewCount: 0 });
    });

    test("aggregate throws => 500", async () => {
      jest.spyOn(Review, "aggregate").mockRejectedValueOnce(new Error("agg down"));

      const res = await request(app)
        .post("/api/reviews/ratings-batch")
        .send({ placeIds: ["p1", "p2"] });

      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/failed to batch ratings/i);
    });
  });

  describe("POST /api/reviews", () => {
    test("success returns 201", async () => {
      const payload = {
        place_id: "p-success-1",
        user_id: "u1",
        user_name: "Tester",
        rating: 4,
        comment: "ok",
      };

      const res = await request(app).post("/api/reviews").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
    });

    test("missing fields returns 400", async () => {
      const res = await request(app).post("/api/reviews").send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /api/reviews/user/:userId", () => {
    test("attaches toilet_name", async () => {
      await Review.create([
        { review_id: "r1", place_id: "p1", user_id: "u1", user_name: "A", rating: 4, comment: "ok", created_date: new Date() },
        { review_id: "r2", place_id: "p2", user_id: "u1", user_name: "A", rating: 5, comment: "nice", created_date: new Date() },
      ]);

      await Toilet.create([
        makeToilet({ place_id: "p1", toilet_name: "Toilet 1" }),
        makeToilet({ place_id: "p2", toilet_name: "Toilet 2" }),
      ]);

      const res = await request(app).get("/api/reviews/user/u1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty("toilet_name");
    });

    test("toilet not found still returns reviews", async () => {
      await Review.create([
        { review_id: "r1", user_id: "u1", place_id: "no-such-place", rating: 5, comment: "ok", created_date: new Date() },
      ]);

      const res = await request(app).get("/api/reviews/user/u1");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].toilet_name).toBe("Unknown toilet");
    });

    test("no reviews => []", async () => {
      const res = await request(app).get("/api/reviews/user/u-no");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("db throws => 500", async () => {
      jest.spyOn(Review, "find").mockReturnValueOnce({
        lean: jest.fn().mockRejectedValueOnce(new Error("db down")),
      });
    
      const res = await request(app).get("/api/reviews/user/u1");
      expect(res.status).toBe(500);
    

      expect(res.body.message).toMatch(/failed to fetch user reviews/i);
    });
    
  });

  describe("GET /api/reviews/:place_id/average-rating", () => {
    test("no reviews => 200 with 0/0", async () => {
      const res = await request(app).get("/api/reviews/p-no/average-rating");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ averageRating: 0, reviewCount: 0 });
    });

    test("returns avg + count", async () => {
      await Review.create([
        { review_id: "ra1", place_id: "p1", user_id: "u1", user_name: "A", rating: 4, comment: "ok", created_date: new Date() },
        { review_id: "ra2", place_id: "p1", user_id: "u2", user_name: "B", rating: 2, comment: "meh", created_date: new Date() },
      ]);

      const res = await request(app).get("/api/reviews/p1/average-rating");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ averageRating: 3, reviewCount: 2 });
    });

    test("db error => 500", async () => {
      jest.spyOn(Review, "find").mockRejectedValueOnce(new Error("db down"));

      const res = await request(app).get("/api/reviews/p1/average-rating");
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /api/reviews/:place_id", () => {
    test("returns reviews list", async () => {
      await Review.create([
        { review_id: "rp1", place_id: "p1", user_id: "u1", user_name: "A", rating: 5, comment: "good", created_date: new Date() },
        { review_id: "rp2", place_id: "p1", user_id: "u2", user_name: "B", rating: 3, comment: "ok", created_date: new Date() },
        { review_id: "rp3", place_id: "p2", user_id: "u3", user_name: "C", rating: 1, comment: "bad", created_date: new Date() },
      ]);

      const res = await request(app).get("/api/reviews/p1");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body.every((r) => r.place_id === "p1")).toBe(true);
    });

    test("db error => 500", async () => {
      jest.spyOn(Review, "find").mockRejectedValueOnce(new Error("db down"));

      const res = await request(app).get("/api/reviews/p1");
      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("DELETE /api/reviews/:id", () => {
    test("non-existing but valid ObjectId returns 204", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app).delete(`/api/reviews/${fakeId}`);
      expect(res.status).toBe(204);
    });

    test("invalid id => 400", async () => {
      const res = await request(app).delete("/api/reviews/not-a-valid-objectid");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    test("db error => 400", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      jest.spyOn(Review, "findByIdAndDelete").mockRejectedValueOnce(new Error("db down"));

      const res = await request(app).delete(`/api/reviews/${id}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/db down/i);
    });
  });
});
