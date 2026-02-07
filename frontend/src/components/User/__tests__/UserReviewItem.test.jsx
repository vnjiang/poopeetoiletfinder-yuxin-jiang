import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserReviewItem from "../UserReviewItem";

describe("UserReviewItem", () => {
  test("renders toilet name/comment/date; clicking Delete calls onDelete(_id)", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    const review = {
      _id: "r1",
      toilet_name: "Toilet A",
      comment: "Nice!",
      created_date: "2025-01-01T00:00:00.000Z",
    };

    render(<UserReviewItem review={review} onDelete={onDelete} />);

    expect(screen.getByText("Toilet A")).toBeInTheDocument();
    expect(screen.getByText("Nice!")).toBeInTheDocument();

    const expectedDate = new Date(review.created_date).toLocaleDateString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledWith("r1");
  });

  test("when toilet_name is missing, shows default title 'Toilet review'", () => {
    const review = {
      _id: "r2",
      toilet_name: "",
      comment: "ok",
      createdAt: "2025-01-02T00:00:00.000Z", 
    };

    render(<UserReviewItem review={review} onDelete={jest.fn()} />);
    expect(screen.getByText("Toilet review")).toBeInTheDocument();
  });
});
