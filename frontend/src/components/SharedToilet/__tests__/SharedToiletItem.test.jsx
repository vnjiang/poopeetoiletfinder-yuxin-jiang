import React from "react";import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedToiletItem from "../SharedToiletItem";

describe("SharedToiletItem", () => {
  test("renders name, type/price, description, eircode/contact, and status badge", () => {
    const toilet = {
      _id: "t2",
      toilet_name: "My Toilet",
      toilet_description: "Clean and quiet",
      type: "paid",
      price: "0.5",
      eircode: "T12ABCD",
      contact_number: "0891234567",
      approved_by_admin: false,
      rejected: false,
    };

    render(<SharedToiletItem toilet={toilet} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("My Toilet")).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();

    expect(screen.getByText(/pending/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  test("clicking Edit calls onEdit(toilet); clicking Delete calls onDelete(toilet._id)", async () => {
    const user = userEvent.setup();

    const toilet = {
      _id: "t2",
      toilet_name: "My Toilet",
      toilet_description: "Clean and quiet",
      type: "paid",
      price: "0.5",
      eircode: "T12ABCD",
      contact_number: "0891234567",
      approved_by_admin: false,
      rejected: false,
    };

    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    render(<SharedToiletItem toilet={toilet} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(toilet);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("t2");

    confirmSpy.mockRestore();
  });

  test("when fields are missing: falls back to default name; does not render eircode/contact rows", () => {
    const toilet = {
      _id: "t3",
      toilet_name: "",
      toilet_description: "",
      type: "free",
    };

    render(
      <SharedToiletItem toilet={toilet} onEdit={jest.fn()} onDelete={jest.fn()} />
    );

    expect(screen.getByText("Shared toilet")).toBeInTheDocument();

    expect(screen.queryByText(/Eircode:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Contact:/i)).not.toBeInTheDocument();
  });
});
