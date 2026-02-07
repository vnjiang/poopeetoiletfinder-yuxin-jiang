import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedToiletList from "../SharedToiletList";

describe("SharedToiletList", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("shows empty-state message when items is empty (or becomes empty after filtering)", () => {
    render(<SharedToiletList items={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(
      screen.getByText("You haven’t shared any toilets yet.")
    ).toBeInTheDocument();
  });

  test("filters out null / non-object values / and items missing _id", () => {
    const items = [
      null,
      "bad",
      {},
      { toilet_name: "no id" },
      { _id: "ok1", toilet_name: "A", type: "free", toilet_description: "d" },
    ];

    render(<SharedToiletList items={items} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("no id")).not.toBeInTheDocument();
  });

  test("renders multiple items, and Edit/Delete triggers the callback chain", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    const items = [
      {
        _id: "t1",
        toilet_name: "Toilet 1",
        toilet_description: "d1",
        type: "free",
      },
      {
        _id: "t2",
        toilet_name: "Toilet 2",
        toilet_description: "d2",
        type: "paid",
        price: "€1",
      },
    ];

    render(<SharedToiletList items={items} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText("Toilet 1")).toBeInTheDocument();
    expect(screen.getByText("Toilet 2")).toBeInTheDocument();

    const editButtons = screen.getAllByRole("button", { name: "Edit" });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });

    await user.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ _id: "t1" }));

    await user.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith("t2");
  });
});
