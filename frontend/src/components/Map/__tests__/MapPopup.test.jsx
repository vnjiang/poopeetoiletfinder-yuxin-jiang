//src/components/Map/__tests__/MapPopup.test.jsx

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MapPopup from "../MapPopup";

const mockCalculateDistance = jest.fn();
const mockUserToToiletNavigation = jest.fn();
const mockRenderStars = jest.fn();
const mockRateAndReviewClick = jest.fn();

jest.mock("../../../utils/utils", () => ({
  calculateDistance: (...args) => mockCalculateDistance(...args),
  userToToiletNavigation: (...args) => mockUserToToiletNavigation(...args),
  renderStarAverageRatingCount: (...args) => mockRenderStars(...args),
  rateAndReviewClick: (...args) => mockRateAndReviewClick(...args),
}));

const mockGetFeeLabel = jest.fn();
jest.mock("../../../utils/priceLabel", () => ({
  getFeeLabel: (...args) => mockGetFeeLabel(...args),
}));


describe("MapPopup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.open = jest.fn();

    Object.defineProperty(window, "location", {
      value: { href: "http://localhost/" },
      writable: true,
    });

    mockCalculateDistance.mockReturnValue(1.234);
    mockGetFeeLabel.mockReturnValue("Free");
    mockUserToToiletNavigation.mockReturnValue("https://nav.example");
    mockRateAndReviewClick.mockReturnValue("/rate/PLACE123");
    mockRenderStars.mockReturnValue(<span data-testid="stars">stars</span>);
  });

  test("returns null when toilet or center is missing", () => {
    const { container: c1 } = render(<MapPopup toilet={null} center={{ lat: 1, lng: 2 }} />);
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(<MapPopup toilet={{}} center={null} />);
    expect(c2.firstChild).toBeNull();
  });

  test("renders properly: name/description/fee/distance/buttons", () => {
    const toilet = {
      place_id: "PLACE123",
      toilet_name: "Test Toilet",
      toilet_description: "Nice and clean",
      location: { coordinates: [120.1, 30.2] }, // [lng, lat]
    };

    render(
      <MapPopup
        toilet={toilet}
        center={{ lat: 30.0, lng: 120.0 }}
        averageRating={4.5}
        reviewCount={10}
      />
    );

    expect(screen.getByText("Test Toilet")).toBeInTheDocument();
    expect(screen.getByText("Nice and clean")).toBeInTheDocument();
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.getByText("1.2 km")).toBeInTheDocument();
    expect(screen.getByTestId("stars")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Navigate/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rate & Review/i })).toBeInTheDocument();
  });

  test("shows 'No reviews yet' when reviewCount=0", () => {
    const toilet = {
      place_id: "PLACE123",
      toilet_name: "NoReview Toilet",
      location: { coordinates: [120.1, 30.2] },
    };

    render(
      <MapPopup
        toilet={toilet}
        center={{ lat: 30.0, lng: 120.0 }}
        averageRating={0}
        reviewCount={0}
      />
    );

    expect(screen.getByText(/No reviews yet/i)).toBeInTheDocument();
  });

  test("clicking Navigate opens the navigation URL with window.open", async () => {
    const user = userEvent.setup();
    const toilet = {
      place_id: "PLACE123",
      toilet_name: "Nav Toilet",
      location: { coordinates: [120.1, 30.2] },
    };

    render(<MapPopup toilet={toilet} center={{ lat: 30.0, lng: 120.0 }} reviewCount={0} />);

    await user.click(screen.getByRole("button", { name: /Navigate/i }));

    expect(mockUserToToiletNavigation).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalledWith("https://nav.example", "_blank");
  });

  test("clicking Rate & Review updates window.location.href", async () => {
    const user = userEvent.setup();
    const toilet = {
      place_id: "PLACE123",
      toilet_name: "Rate Toilet",
      location: { coordinates: [120.1, 30.2] },
    };

    render(<MapPopup toilet={toilet} center={{ lat: 30.0, lng: 120.0 }} reviewCount={0} />);

    await user.click(screen.getByRole("button", { name: /Rate & Review/i }));

    expect(mockRateAndReviewClick).toHaveBeenCalledWith("PLACE123");
    expect(window.location.href).toBe("/rate/PLACE123");
  });
});
