// src/services/__tests__/mapService.test.js
import { fetchNearbyToilets, fetchToiletRatings, fetchMapData } from "../mapService";

jest.mock("../../utils/utils", () => ({
  fetchRatingsBatch: jest.fn(),
}));

import { fetchRatingsBatch } from "../../utils/utils";

describe("mapService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("fetchNearbyToilets ok -> returns toilets json", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => [{ place_id: "p1" }],
    });

    const res = await fetchNearbyToilets({ lat: 1, lng: 2 });
    expect(global.fetch).toHaveBeenCalledWith("/routes/toiletRoute/fetch-toilets?lat=1&lng=2");
    expect(res).toEqual([{ place_id: "p1" }]);
  });

  test("fetchNearbyToilets bad response -> throws", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => "text/html" },
      json: async () => [],
    });

    await expect(fetchNearbyToilets({ lat: 1, lng: 2 })).rejects.toThrow(/Fetch toilets failed/);
  });

  test("fetchToiletRatings empty -> {}", async () => {
    expect(await fetchToiletRatings([])).toEqual({});
    expect(fetchRatingsBatch).not.toHaveBeenCalled();
  });

  test("fetchToiletRatings -> calls fetchRatingsBatch with unique placeIds", async () => {
    fetchRatingsBatch.mockResolvedValueOnce({ p1: { averageRating: 4 } });

    const toilets = [{ place_id: "p1" }, { place_id: "p1" }, { place_id: "p2" }];
    const res = await fetchToiletRatings(toilets);

    expect(fetchRatingsBatch).toHaveBeenCalledWith(["p1", "p2"]);
    expect(res).toEqual({ p1: { averageRating: 4 } });
  });

  test("fetchMapData -> returns {toilets, ratingsMap}", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => [{ place_id: "p1" }],
    });
    fetchRatingsBatch.mockResolvedValueOnce({ p1: { averageRating: 4 } });

    const res = await fetchMapData({ lat: 1, lng: 2 });
    expect(res.toilets).toHaveLength(1);
    expect(res.ratingsMap).toEqual({ p1: { averageRating: 4 } });
  });
});
