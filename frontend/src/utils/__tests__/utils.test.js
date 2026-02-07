

import React from "react";
import { render, screen } from "@testing-library/react";
import * as u from "../utils";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import axios from "axios"; 


jest.mock("react-icons/fa", () => ({
  FaStar: (props) => <i data-testid="star" {...props} />,
}));

const flush = () => new Promise((r) => setTimeout(r, 0));

describe("utils.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("pure helpers", () => {
    test("rateAndReviewClick", () => {
      expect(u.rateAndReviewClick("abc")).toBe("/rate-and-review/abc");
    });

    test("userToToiletNavigation", () => {
      expect(u.userToToiletNavigation(1, 2, 3, 4)).toBe(
        "https://www.google.com/maps/dir/?api=1&origin=1,2&destination=3,4"
      );
    });

    test("calculateDistance: returns 0 for the same point", () => {
      const d = u.calculateDistance(10, 20, 10, 20);
      expect(d).toBe(0);
    });

    test("calculateDistance: approximate value (range assertion only)", () => {
      // Cork(51.8985,-8.4756) to Dublin(53.3498,-6.2603) ~ 220-230km
      const d = u.calculateDistance(51.8985, -8.4756, 53.3498, -6.2603);
      expect(d).toBeGreaterThan(150);
      expect(d).toBeLessThan(300);
    });
  });

  describe("fetchRatingsBatch", () => {
    test("calls axios.post and returns data", async () => {
      const axios = require("axios").default;
      axios.post.mockResolvedValueOnce({ data: { ok: true } });
  
      const res = await u.fetchRatingsBatch([1, 2, 3]);
  
      expect(axios.post).toHaveBeenCalled();
      expect(res).toEqual({ ok: true });
    });
  });

  describe("fetchToiletsWithRatingAndDistance", () => {
    test("merges ratings + calculates distance + filters invalid toilets", async () => {
      const center = { lat: 51.0, lng: -8.0 };

      axios.get.mockResolvedValueOnce({
        data: [
 
          { place_id: "p1", location: { coordinates: [-8.1, 51.1] }, name: "A" },

          { location: { coordinates: [-8.2, 51.2] }, name: "B" },
          { place_id: "p3", location: { coordinates: [] }, name: "C" },
        ],
      });

      axios.post.mockResolvedValueOnce({
        data: {
          p1: { averageRating: 4.2, reviewCount: 7 },
        },
      });
      
      const res = await u.fetchToiletsWithRatingAndDistance(center);

      expect(res).toHaveLength(1);
      expect(res[0].place_id).toBe("p1");
      expect(res[0].averageRating).toBe(4.2);
      expect(res[0].reviewCount).toBe(7);
      expect(typeof res[0].toiletDistance).toBe("number");
      expect(res[0].toiletDistance).toBeGreaterThan(0);
    });

    test("backend failure: returns []", async () => {
      axios.get.mockRejectedValueOnce(new Error("fail"));
      await expect(u.fetchToiletsWithRatingAndDistance({ lat: 0, lng: 0 })).resolves.toEqual([]);
    });
  });

  describe("getUserLocation", () => {
    test("no geolocation -> fallback", async () => {
      const old = navigator.geolocation;

      Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true });

      const setCenter = jest.fn();
      u.getUserLocation(setCenter);
      await flush();

      expect(setCenter).toHaveBeenCalledWith({ lat: 51.8985, lng: -8.4756 });

      Object.defineProperty(navigator, "geolocation", { value: old, configurable: true });
    });

    test("low accuracy succeeds on first try", async () => {
      const setCenter = jest.fn();

      const mockGetCurrentPosition = jest.fn((success) => {
        success({ coords: { latitude: 1, longitude: 2 } });
      });

      Object.defineProperty(navigator, "geolocation", {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
      });

      u.getUserLocation(setCenter);
      await flush();

      expect(setCenter).toHaveBeenCalledWith({ lat: 1, lng: 2 });
    });

    test("low accuracy fails, high accuracy succeeds", async () => {
      const setCenter = jest.fn();
      let call = 0;

      const mockGetCurrentPosition = jest.fn((success, error) => {
        call += 1;
        if (call === 1) return error(new Error("low fail"));
        return success({ coords: { latitude: 9, longitude: 8 } });
      });

      Object.defineProperty(navigator, "geolocation", {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
      });

      u.getUserLocation(setCenter);
      await flush();

      expect(setCenter).toHaveBeenCalledWith({ lat: 9, lng: 8 });
    });

    test("both attempts fail -> fallback", async () => {
      const setCenter = jest.fn();

      const mockGetCurrentPosition = jest.fn((success, error) => {
        error(new Error("fail"));
      });

      Object.defineProperty(navigator, "geolocation", {
        value: { getCurrentPosition: mockGetCurrentPosition },
        configurable: true,
      });

      u.getUserLocation(setCenter);
      await flush();

      expect(setCenter).toHaveBeenCalledWith({ lat: 51.8985, lng: -8.4756 });
    });
  });

  describe("render stars", () => {
    test("renderStarWithoutCount: renders 5 stars, first N stars have correct color", () => {
      const { container } = render(<div>{u.renderStarWithoutCount(3)}</div>);

      const stars = screen.getAllByTestId("star");
      expect(stars).toHaveLength(5);

      expect(stars[0]).toHaveAttribute("color", "#F2C265");
      expect(stars[1]).toHaveAttribute("color", "#F2C265");
      expect(stars[2]).toHaveAttribute("color", "#F2C265");
      expect(stars[3]).toHaveAttribute("color", "#a9a9a9");
      expect(stars[4]).toHaveAttribute("color", "#a9a9a9");

      expect(container).toBeTruthy();
    });

    test("renderStarAverageRatingCount: handles NaN safely, shows 0.0 and (0)", () => {
      render(<div>{u.renderStarAverageRatingCount(NaN, NaN)}</div>);
      expect(screen.getByText("0.0")).toBeInTheDocument();
      expect(screen.getByText("(0)")).toBeInTheDocument();
    });
  });

  describe("changeDateFormat", () => {
    test("calls toLocaleDateString", () => {
      const spy = jest
        .spyOn(Date.prototype, "toLocaleDateString")
        .mockReturnValue("2025/01/01");

      expect(u.changeDateFormat("2025-01-01T00:00:00Z")).toBe("2025/01/01");
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });
  });
});
