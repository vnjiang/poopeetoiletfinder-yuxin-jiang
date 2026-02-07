import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserReviewList from "../UserReviewList";

describe("UserReviewList", () => {
  test("shows an empty state message when reviews is empty", () => {
    render(<UserReviewList reviews={[]} onDelete={jest.fn()} />);
    expect(
      screen.getByText("You haven’t written any reviews yet.")
    ).toBeInTheDocument();
  });

  test("renders multiple items when reviews has data; clicking Delete passes the _id to onDelete", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    const reviews = [
      { _id: "r1", toilet_name: "A", comment: "c1", created_date: "2025-01-01T00:00:00.000Z" },
      { _id: "r2", toilet_name: "B", comment: "c2", created_date: "2025-01-02T00:00:00.000Z" },
    ];

    render(<UserReviewList reviews={reviews} onDelete={onDelete} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();

    const deleteBtns = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteBtns).toHaveLength(2);

    await user.click(deleteBtns[0]);
    expect(onDelete).toHaveBeenCalledWith("r1");
  });
});
