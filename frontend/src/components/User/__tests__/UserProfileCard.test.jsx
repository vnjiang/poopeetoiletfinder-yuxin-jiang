import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserProfileCard from "../UserProfileCard";

describe("UserProfileCard", () => {
  test("renders displayName/email/uid/joined date and allows clicking Log out", async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    const fakeUser = {
      displayName: "Jack",
      email: "jack@test.com",
      uid: "u123",
      metadata: { creationTime: "2025-01-01T00:00:00.000Z" },
    };

    render(<UserProfileCard user={fakeUser} onLogout={onLogout} />);

    expect(screen.getByText("Jack")).toBeInTheDocument();
    expect(screen.getByText("jack@test.com")).toBeInTheDocument();
    expect(screen.getByText(/User ID:\s*u123/i)).toBeInTheDocument();
    const expectedDate = new Date(fakeUser.metadata.creationTime).toLocaleDateString();
    expect(screen.getByText(new RegExp(`Joined\\s+${expectedDate}`))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /log out/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test("falls back to 'Anonymous User' when displayName is missing", () => {
    const fakeUser = {
      displayName: "",
      email: "no-name@test.com",
      uid: "u1",
      metadata: { creationTime: "2025-01-01T00:00:00.000Z" },
    };

    render(<UserProfileCard user={fakeUser} onLogout={jest.fn()} />);
    expect(screen.getByText("Anonymous User")).toBeInTheDocument();
  });
});
