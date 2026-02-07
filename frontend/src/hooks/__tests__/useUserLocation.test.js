// src/hooks/useUserLocation.test.js
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUserLocation } from "../useUserLocation";



jest.mock("../../utils/utils", () => ({
  getUserLocation: jest.fn(),
}));

import { getUserLocation } from "../../utils/utils";

describe("useUserLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls getUserLocation(setCenter) on mount and updates center", async () => {
    
    getUserLocation.mockImplementation((setCenter) => {
      setCenter({ lat: 51.9, lng: -8.47 });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(getUserLocation).toHaveBeenCalledTimes(1);
    expect(typeof getUserLocation.mock.calls[0][0]).toBe("function");

    await waitFor(() => {
      expect(result.current.center).toEqual({ lat: 51.9, lng: -8.47 });
    });
  });

  test("calls getUserLocation(setCenter) on mount and updates center", async () => {
    getUserLocation.mockImplementation((setCenter) => {
      setCenter({ lat: 1, lng: 2 });
    });

    const { result } = renderHook(() => useUserLocation());

    expect(getUserLocation).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.locate();
    });

    expect(getUserLocation).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(result.current.center).toEqual({ lat: 1, lng: 2 });
    });
  });
});
