// src/components/RateAndReview/__tests__/ReviewSummary.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewSummary from "../ReviewSummary";
import * as utils from "../../../utils/utils";

jest.mock("../../../utils/utils", () => ({
  renderStarWithoutCount: jest.fn(() => [<span key="s">★</span>]),
}));

describe("ReviewSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("when total=0: shows 0.0 and 'No reviews yet', and the button is still visible", () => {
    const onWrite = jest.fn();
    render(<ReviewSummary avgRating={4.2} total={0} onWrite={onWrite} />);

    expect(screen.getByText(/^0(\.0+)?$/)).toBeInTheDocument();
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
    expect(utils.renderStarWithoutCount).toHaveBeenCalledTimes(1);
    expect(utils.renderStarWithoutCount).toHaveBeenCalledWith(0);

    expect(screen.getByRole("button", { name: "Write review" })).toBeInTheDocument();
  });

  test("when total>0: shows avgRating (1 decimal), plural 'reviews', and renders stars", () => {
    render(<ReviewSummary avgRating={4.26} total={2} onWrite={jest.fn()} />);
    expect(screen.getByText("4.3")).toBeInTheDocument();
    expect(screen.getByText("2 reviews")).toBeInTheDocument();
    expect(utils.renderStarWithoutCount).toHaveBeenCalledWith(4);
  });

  test("when total=1: uses singular label '1 review'", () => {
    render(<ReviewSummary avgRating={3.9} total={1} onWrite={jest.fn()} />);

    expect(screen.getByText("1 review")).toBeInTheDocument();
  });

  test("clicking 'Write review' triggers onWrite", async () => {
    const user = userEvent.setup();
    const onWrite = jest.fn();

    render(<ReviewSummary avgRating={4.0} total={1} onWrite={onWrite} />);

    await user.click(screen.getByRole("button", { name: "Write review" }));
    expect(onWrite).toHaveBeenCalledTimes(1);
  });
});
