// src/services/__tests__/adminService.test.js
jest.mock("../apiClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

import apiClient from "../apiClient";
import { fetchPendingToilets, approveToilet, rejectToilet } from "../adminService";

describe("adminService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("fetchPendingToilets calls GET /sharedToiletRoute with approved_by_admin=false", async () => {
    apiClient.get.mockResolvedValueOnce([{ _id: "t1" }]);

    const res = await fetchPendingToilets();

    expect(apiClient.get).toHaveBeenCalledWith("/sharedToiletRoute", {
      params: { approved_by_admin: false },
    });
    expect(res).toEqual([{ _id: "t1" }]);
  });

  test("approveToilet calls PUT /sharedToiletRoute/:id with payload", async () => {
    apiClient.put.mockResolvedValueOnce({ ok: true });

    await approveToilet("t1", { approved_by_admin: true, rejected: false });

    expect(apiClient.put).toHaveBeenCalledWith("/sharedToiletRoute/t1", {
      approved_by_admin: true,
      rejected: false,
    });
  });

  test("rejectToilet calls PUT /sharedToiletRoute/reject/:id", async () => {
    apiClient.put.mockResolvedValueOnce({ ok: true });

    await rejectToilet("t9");

    expect(apiClient.put).toHaveBeenCalledWith("/sharedToiletRoute/reject/t9");
  });
});
