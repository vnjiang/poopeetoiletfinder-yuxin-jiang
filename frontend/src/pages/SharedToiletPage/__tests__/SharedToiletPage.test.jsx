import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SharedToiletPage from "../SharedToiletPage";


import { useAuth } from "../../../context/authContext";
jest.mock("../../../context/authContext", () => ({
  useAuth: jest.fn(),
}));


import {
  fetchUserSharedToilets,
  createSharedToilet,
  updateSharedToilet,
  deleteSharedToilet,
} from "../../../services/sharedToiletService";

jest.mock("../../../services/sharedToiletService", () => ({
  fetchUserSharedToilets: jest.fn(),
  createSharedToilet: jest.fn(),
  updateSharedToilet: jest.fn(),
  deleteSharedToilet: jest.fn(),
}));


jest.mock("../../../components/SharedToilet/SharedToiletForm", () => {
  return function MockSharedToiletForm(props) {
    const { value, onChange, onSubmit, isEditing, loading } = props;

    return (
      <form onSubmit={onSubmit} aria-label="shared-toilet-form">
        <div>FORM: {isEditing ? "editing" : "creating"}</div>
        <div>{loading ? "Loading..." : "Idle"}</div>

        <label>
          Toilet Name
          <input
            aria-label="toilet_name"
            value={value.toilet_name || ""}
            onChange={(e) => onChange("toilet_name", e.target.value)}
          />
        </label>

        <label>
          Eircode
          <input
            aria-label="eircode"
            value={value.eircode || ""}
            onChange={(e) => onChange("eircode", e.target.value)}
          />
        </label>

        <label>
          Type
          <select
            aria-label="type"
            value={value.type || "free"}
            onChange={(e) => onChange("type", e.target.value)}
          >
            <option value="free">free</option>
            <option value="paid">paid</option>
          </select>
        </label>

        <label>
          Price
          <input
            aria-label="price"
            value={value.price || ""}
            onChange={(e) => onChange("price", e.target.value)}
          />
        </label>

        <button type="submit">Submit</button>
      </form>
    );
  };
});

jest.mock("../../../components/SharedToilet/SharedToiletList", () => {
  return function MockSharedToiletList(props) {
    const { items = [], onEdit, onDelete } = props;

    return (
      <div aria-label="shared-toilet-list">
        {items.length === 0 ? (
          <div>No items</div>
        ) : (
          items.map((t) => (
            <div key={t._id} data-testid={`item-${t._id}`}>
              <div>{t.toilet_name}</div>
              <button onClick={() => onEdit(t)}>Edit</button>
              <button onClick={() => onDelete(t._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    );
  };
});

describe("SharedToiletPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("When there is no user: it should not fetch the list, renders the Share button, and the form is hidden by default", async () => {
    useAuth.mockReturnValue({ user: null });

    render(<SharedToiletPage />);

    expect(screen.getByRole("button", { name: /share a toilet/i })).toBeInTheDocument();
    expect(fetchUserSharedToilets).not.toHaveBeenCalled();

    expect(screen.queryByLabelText("shared-toilet-form")).not.toBeInTheDocument();
  });

  test("When there is a user: it fetches the list by user.uid and renders items in the List", async () => {
    useAuth.mockReturnValue({ user: { uid: "u1" } });

    fetchUserSharedToilets.mockResolvedValueOnce([
      { _id: "t1", toilet_name: "Toilet A", type: "free", eircode: "D01XXXX" },
    ]);

    render(<SharedToiletPage />);

    await waitFor(() => {
      expect(fetchUserSharedToilets).toHaveBeenCalledWith("u1");
    });

    expect(await screen.findByText("Toilet A")).toBeInTheDocument();
  });

  test("Clicking 'Share a toilet' shows the form", async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({ user: { uid: "u1" } });
    fetchUserSharedToilets.mockResolvedValueOnce([]);

    render(<SharedToiletPage />);

    expect(screen.queryByLabelText("shared-toilet-form")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /share a toilet/i }));

    expect(screen.getByLabelText("shared-toilet-form")).toBeInTheDocument();
    expect(screen.getByText(/FORM: creating/i)).toBeInTheDocument();
  });

  test("Create flow: fill and submit => calls createSharedToilet, adds item to list, and closes the form", async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({ user: { uid: "u1" } });
    fetchUserSharedToilets.mockResolvedValueOnce([]);

    createSharedToilet.mockResolvedValueOnce({
      _id: "new1",
      toilet_name: "New Toilet",
      type: "free",
      eircode: "D02YYYY",
    });

    render(<SharedToiletPage />);

    await user.click(screen.getByRole("button", { name: /share a toilet/i }));

    await user.type(screen.getByLabelText("toilet_name"), "New Toilet");
    await user.type(screen.getByLabelText("eircode"), "D02YYYY");

    await user.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(createSharedToilet).toHaveBeenCalledTimes(1);
    });

    expect(createSharedToilet).toHaveBeenCalledWith(
      expect.objectContaining({
        toilet_name: "New Toilet",
        eircode: "D02YYYY",
        userId: "u1",
      })
    );


    expect(await screen.findByText("New Toilet")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByLabelText("shared-toilet-form")).not.toBeInTheDocument();
    });
  });

  test("Edit flow: click Edit => form enters editing mode, submit => calls updateSharedToilet and updates the list", async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({ user: { uid: "u1" } });

    fetchUserSharedToilets.mockResolvedValueOnce([
      { _id: "t1", toilet_name: "Old Name", type: "free", eircode: "D01XXXX" },
    ]);

    updateSharedToilet.mockResolvedValueOnce({
      _id: "t1",
      toilet_name: "Updated Name",
      type: "free",
      eircode: "D01XXXX",
    });

    render(<SharedToiletPage />);

    expect(await screen.findByText("Old Name")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Edit/i }));

    expect(screen.getByLabelText("shared-toilet-form")).toBeInTheDocument();
    expect(screen.getByText(/FORM: editing/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText("toilet_name");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");

    await user.click(screen.getByRole("button", { name: /Submit/i }));

    await waitFor(() => {
      expect(updateSharedToilet).toHaveBeenCalledTimes(1);
    });


    expect(updateSharedToilet).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({ toilet_name: "Updated Name" })
    );

    expect(await screen.findByText("Updated Name")).toBeInTheDocument();
  });

  test("Delete flow: click Delete => calls deleteSharedToilet and removes the item from the list", async () => {
    const user = userEvent.setup();

    useAuth.mockReturnValue({ user: { uid: "u1" } });

    fetchUserSharedToilets.mockResolvedValueOnce([
      { _id: "t1", toilet_name: "Toilet A", type: "free", eircode: "D01XXXX" },
    ]);

    deleteSharedToilet.mockResolvedValueOnce({ ok: true });

    render(<SharedToiletPage />);

    expect(await screen.findByText("Toilet A")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Delete/i }));

    await waitFor(() => {
      expect(deleteSharedToilet).toHaveBeenCalledWith("t1");
    });

    await waitFor(() => {
      expect(screen.queryByText("Toilet A")).not.toBeInTheDocument();
    });
  });
});
