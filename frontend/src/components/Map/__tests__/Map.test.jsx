// src/components/Map/__tests__/Map.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";


jest.mock("../MapPopup", () => {
  return function MockMapPopup() {
    return <div data-testid="mock-map-popup" />;
  };
});

jest.mock("../../../hooks/useScript", () => {
  return {
    __esModule: true,
    default: () => [true],
  };
});

jest.mock("../../../hooks/useGoogleMap", () => {
  return {
    useGoogleMap: () => ({ containerRef: { current: null } }),
  };
});

const mockFetchMapData = jest.fn();
jest.mock("../../../services/mapService", () => ({
  fetchMapData: (...args) => mockFetchMapData(...args),
}));

const Map = require("../Map").default;

describe("Map", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY = "test-key";
  });

  test("renders the map container div.map", () => {
    mockFetchMapData.mockResolvedValueOnce({ toilets: [], ratingsMap: {} });
    render(<Map center={{ lat: 51.9, lng: -8.47 }} />);
    const el = document.querySelector(".map");
    expect(el).toBeTruthy();
  });

  test("when center is set and scriptLoaded=true, it calls fetchMapData", async () => {
    mockFetchMapData.mockResolvedValueOnce({
      toilets: [{ _id: "t1", toilet_name: "A" }],
      ratingsMap: { t1: { averageRating: 4.2, reviewCount: 10 } },
    });

    render(<Map center={{ lat: 51.9, lng: -8.47 }} />);

    await waitFor(() => {
      expect(mockFetchMapData).toHaveBeenCalledTimes(1);
    });

    expect(mockFetchMapData).toHaveBeenCalledWith({
      lat: 51.9,
      lng: -8.47,
    });
  });

  test("returns null when API key is missing (does not render .map)", () => {
    delete process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    mockFetchMapData.mockResolvedValueOnce({ toilets: [], ratingsMap: {} });

    render(<Map center={{ lat: 1, lng: 2 }} />);

    const el = document.querySelector(".map");
    expect(el).toBeNull();
  });
});
