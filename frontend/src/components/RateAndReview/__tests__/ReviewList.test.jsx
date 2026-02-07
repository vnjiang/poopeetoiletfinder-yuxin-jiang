import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewList from "../ReviewList";

jest.mock("../../../utils/utils", () => ({
  renderStarWithoutCount: jest.fn(() => "★"),
  changeDateFormat: jest.fn(() => "2025-01-01"),
}));

describe("ReviewList", () => {  
  test("shows a hint message when reviews is empty", () => {
    render(<ReviewList reviews={[]} currentUser={null} onDelete={jest.fn()} />);

    expect(
      screen.getByText("Be the first to share your experience.")
    ).toBeInTheDocument();
  });

  test("renders list when reviews exist; only current user's reviews show the Delete button", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    const reviews = [
      {
        _id: "r1",
        user_id: "u1",
        user_name: "Jack",
        created_date: "2025-01-01",
        rating: 4.2,
        comment: "A",
      },
      {
        _id: "r2",
        user_id: "u2",
        user_name: "Amy",
        created_date: "2025-01-02",
        rating: 3,
        comment: "B",
      },
    ];

    render(
      <ReviewList
        reviews={reviews}
        currentUser={{ uid: "u1" }}
        onDelete={onDelete}
      />
    );


    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();

    const deleteBtns = screen.getAllByRole("button", { name: /delete review/i });
    expect(deleteBtns).toHaveLength(1);

    await user.click(deleteBtns[0]);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("r1");
  });
});
