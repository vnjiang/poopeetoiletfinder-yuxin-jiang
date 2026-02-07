import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewForm from "../ReviewForm";

describe("ReviewForm", () => {
  test("shows validation errors and prevents submit when rating is missing or comment is too short", async () => {

    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ReviewForm onSubmit={onSubmit} isSubmitting={false} submitError={null} />);

    await user.click(screen.getByRole("button", { name: /submit review/i }));

    expect(screen.getByText(/please select a rating/i)).toBeInTheDocument();
    expect(screen.getByText(/your review is too short/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test("With valid input: calls onSubmit and trims the comment", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<ReviewForm onSubmit={onSubmit} isSubmitting={false} submitError={null} />);
    await user.click(screen.getByRole("button", { name: /rate 4 star/i }));

    const textarea = screen.getByPlaceholderText(/what was your experience like/i);
    await user.type(textarea, "   hello world   ");

    await user.click(screen.getByRole("button", { name: /submit review/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      rating: 4,
      comment: "hello world",
    });
  });

  test("When isSubmitting=true: disables the button and changes the label to Submitting…", () => {
    const onSubmit = jest.fn();

    render(<ReviewForm onSubmit={onSubmit} isSubmitting={true} submitError={null} />);

    const btn = screen.getByRole("button", { name: /submitting/i });
    expect(btn).toBeDisabled();
  });

  test("When submitError is set: shows the error message", () => {
    render(
      <ReviewForm
        onSubmit={jest.fn()}
        isSubmitting={false}
        submitError="Network error"
      />
    );

    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});
