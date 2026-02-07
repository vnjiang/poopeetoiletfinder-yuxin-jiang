import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../../utils/utils", () => ({
  renderStarWithoutCount: jest.fn(() => null), 
  changeDateFormat: jest.fn(() => "2025-01-01"),
}));

import * as utils from "../../../utils/utils";
import ReviewItem from "../ReviewItem";

describe("ReviewItem", () => {
  test("renders user, comment, rating (1 decimal), and calls helper utils", () => {
    const review = {
      _id: "r1",
      user_name: "Jack",
      created_date: "2025-01-01T00:00:00.000Z",
      rating: 4.2,
      comment: "Nice toilet!",
    };

    render(<ReviewItem review={review} canDelete={false} onDelete={jest.fn()} />);
    expect(screen.getByText("Jack")).toBeInTheDocument();

    expect(screen.getByText("Nice toilet!")).toBeInTheDocument();

    expect(screen.getByText("4.2")).toBeInTheDocument();

    expect(utils.changeDateFormat).toHaveBeenCalledWith(review.created_date);
    expect(utils.renderStarWithoutCount).toHaveBeenCalledWith(4);
  });

  test("shows Delete button when canDelete=true, and triggers onDelete(review._id)", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    const review = {
      _id: "r2",
      user_name: "Amy",
      created_date: "2025-01-02T00:00:00.000Z",
      rating: 5,
      comment: "Great!",
    };

    render(<ReviewItem review={review} canDelete={true} onDelete={onDelete} />);

    const btn = screen.getByRole("button", { name: /delete review/i });
    await user.click(btn);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("r2");
  });

  test("falls back to Anonymous when user_name is missing; shows 0.0 when rating is invalid", () => {
    const review = {
      _id: "r3",
      user_name: "",
      created_date: "2025-01-03",
      rating: "not-a-number",
      comment: "ok",
    };

    render(<ReviewItem review={review} canDelete={false} onDelete={jest.fn()} />);

    expect(screen.getByText("Anonymous")).toBeInTheDocument();
    expect(screen.getByText("0.0")).toBeInTheDocument();

    expect(utils.renderStarWithoutCount).toHaveBeenCalledWith(0);
  });
});
