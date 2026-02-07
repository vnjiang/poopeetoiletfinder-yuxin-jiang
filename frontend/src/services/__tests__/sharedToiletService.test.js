// src/services/__tests__/sharedToiletService.test.js

jest.mock("../apiClient", () => ({
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    },
  }));
  
  import apiClient from "../apiClient";
  import {
    fetchUserSharedToilets,
    createSharedToilet,
    updateSharedToilet,
    deleteSharedToilet,
  } from "../sharedToiletService";
  
  describe("sharedToiletService", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test("fetchUserSharedToilets -> GET /sharedToiletRoute/user/:userId", async () => {
      apiClient.get.mockResolvedValueOnce([{ id: "s1" }]);
  
      const res = await fetchUserSharedToilets("u1");
  
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith("/sharedToiletRoute/user/u1");
      expect(res).toEqual([{ id: "s1" }]);
    });
  
    test("createSharedToilet -> POST /sharedToiletRoute", async () => {
      const payload = { toilet_name: "A", toilet_description: "B" };
      apiClient.post.mockResolvedValueOnce({ ok: true });
  
      const res = await createSharedToilet(payload);
  
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/sharedToiletRoute", payload);
      expect(res).toEqual({ ok: true });
    });
  
    test("updateSharedToilet -> PUT /sharedToiletRoute/:id", async () => {
      const payload = { toilet_name: "Updated" };
      apiClient.put.mockResolvedValueOnce({ ok: true });
  
      const res = await updateSharedToilet("sid1", payload);
  
      expect(apiClient.put).toHaveBeenCalledTimes(1);
      expect(apiClient.put).toHaveBeenCalledWith("/sharedToiletRoute/sid1", payload);
      expect(res).toEqual({ ok: true });
    });
  
    test("deleteSharedToilet -> DELETE /sharedToiletRoute/:id", async () => {
      apiClient.delete.mockResolvedValueOnce({ ok: true });
  
      const res = await deleteSharedToilet("sid2");
  
      expect(apiClient.delete).toHaveBeenCalledTimes(1);
      expect(apiClient.delete).toHaveBeenCalledWith("/sharedToiletRoute/sid2");
      expect(res).toEqual({ ok: true });
    });
  });
  