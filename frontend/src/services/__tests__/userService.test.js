// src/services/__tests__/userService.test.js

jest.mock("../apiClient", () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      delete: jest.fn(),
    },
  }));
  
  import apiClient from "../apiClient";
  import { fetchUserReviews, deleteUserReview } from "../userService";
  
  describe("userService", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test("fetchUserReviews -> GET /reviewRoute/user/:userId and return result", async () => {
      apiClient.get.mockResolvedValueOnce([{ _id: "r1" }]);
  
      const res = await fetchUserReviews("u1");
  
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith("/reviewRoute/user/u1");
      expect(res).toEqual([{ _id: "r1" }]);
    });
  
    test("deleteUserReview -> DELETE /reviewRoute/:reviewId", async () => {
      apiClient.delete.mockResolvedValueOnce({ ok: true });
  
      await deleteUserReview("rid1");
  
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
      expect(apiClient.delete).toHaveBeenCalledWith("/reviewRoute/rid1");
    });
  });
  