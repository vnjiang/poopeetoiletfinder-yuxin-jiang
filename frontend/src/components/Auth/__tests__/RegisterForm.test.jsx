import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "../RegisterForm";

import { signInWithPopup, getAdditionalUserInfo } from "firebase/auth";
import { ensureUserProfile } from "../../../services/ensureUserProfile";

jest.mock("firebase/auth", () => ({
  signInWithPopup: jest.fn(),
  getAdditionalUserInfo: jest.fn(),
}));

jest.mock("../../../services/firebase", () => ({
  auth: {},
  googleProvider: {},
}));

jest.mock("../../../services/ensureUserProfile", () => ({
  ensureUserProfile: jest.fn(),
}));

describe("RegisterForm", () => {
  test("submitting calls onSubmit with username/email/password", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<RegisterForm onSubmit={onSubmit} isSubmitting={false} error="" />);

    await user.type(screen.getByLabelText("Username"), "jack");
    await user.type(screen.getByLabelText("Email"), "jack@test.com");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      username: "jack",
      email: "jack@test.com",
      password: "123456",
    });
  });

  test("renders error message from props", () => {
    render(<RegisterForm onSubmit={jest.fn()} isSubmitting={false} error="x" />);
    expect(screen.getByText("x")).toBeInTheDocument();
  });

  test("when isSubmitting=true, buttons are disabled", () => {
    render(<RegisterForm onSubmit={jest.fn()} isSubmitting={true} error="" />);

    expect(
      screen.getByRole("button", { name: "Creating account..." })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: /Sign up with Google/i })
    ).toBeDisabled();
  });

  test("Google sign-up: when isNewUser=true, it calls ensureUserProfile", async () => {
    const user = userEvent.setup();

    signInWithPopup.mockResolvedValueOnce({ user: { uid: "new" } });
    getAdditionalUserInfo.mockReturnValueOnce({ isNewUser: true });

    render(<RegisterForm onSubmit={jest.fn()} isSubmitting={false} error="" />);

    await user.click(screen.getByRole("button", { name: /Sign up with Google/i }));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
      expect(ensureUserProfile).toHaveBeenCalledTimes(1);
      expect(ensureUserProfile).toHaveBeenCalledWith({ uid: "new" });
    });
  });


  test("Google sign-up cancelled/failed: shows oauthError message", async () => {
    const user = userEvent.setup();

    signInWithPopup.mockRejectedValueOnce(new Error("cancel"));

    render(<RegisterForm onSubmit={jest.fn()} isSubmitting={false} error="" />);

    await user.click(screen.getByRole("button", { name: /Sign up with Google/i }));

    expect(
      await screen.findByText("Google sign-up was cancelled or failed.")
    ).toBeInTheDocument();
  });
});
