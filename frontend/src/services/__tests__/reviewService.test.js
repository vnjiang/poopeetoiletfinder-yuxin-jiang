// src/services/__tests__/reviewService.test.js

jest.mock("../apiClient", () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      delete: jest.fn(),
    },
  }));
  
  import apiClient from "../apiClient";
  import { submitReview, fetchReviewsByToilet, deleteReview } from "../reviewService";
  
  describe("reviewService", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test("submitReview -> POST /reviewRoute", async () => {
      const payload = { toilet_id: "t1", rating: 4, comment: "ok" };
      apiClient.post.mockResolvedValueOnce({ ok: true });
  
      const res = await submitReview(payload);
  
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/reviewRoute", payload);
      expect(res).toEqual({ ok: true });
    });
  
    test("fetchReviewsByToilet -> GET /reviewRoute/:toiletId", async () => {
      apiClient.get.mockResolvedValueOnce([{ _id: "r1" }, { _id: "r2" }]);
  
      const res = await fetchReviewsByToilet("t1");
  
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith("/reviewRoute/t1");
      expect(res).toEqual([{ _id: "r1" }, { _id: "r2" }]);
    });
  
    test("deleteReview -> DELETE /reviewRoute/:reviewId", async () => {
      apiClient.delete.mockResolvedValueOnce({ ok: true });
  
      const res = await deleteReview("r99");
  
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
      expect(apiClient.delete).toHaveBeenCalledWith("/reviewRoute/r99");
      expect(res).toEqual({ ok: true });
    });
  });
  