import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";
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

describe("LoginForm", () => {
  test("renders the basic UI", () => {
    render(
      <LoginForm
        onLogin={jest.fn()}
        onResetPassword={jest.fn()}
        isSubmitting={false}
        error=""
        info=""
      />
    );


    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Forgot password?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Continue with Google/i })
    ).toBeInTheDocument();
  });

  test("submitting the form passes email/password to onLogin", async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn();

    render(
      <LoginForm
        onLogin={onLogin}
        onResetPassword={jest.fn()}
        isSubmitting={false}
        error=""
        info=""
      />
    );

    await user.type(screen.getByLabelText("Email"), "a@test.com");
    await user.type(screen.getByLabelText("Password"), "123456");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(onLogin).toHaveBeenCalledWith({
      email: "a@test.com",
      password: "123456",
    });
  });

  test("clicking 'Forgot password?' passes the current email to onResetPassword", async () => {
    const user = userEvent.setup();
    const onResetPassword = jest.fn();

    render(
      <LoginForm
        onLogin={jest.fn()}
        onResetPassword={onResetPassword}
        isSubmitting={false}
        error=""
        info=""
      />
    );

    await user.type(screen.getByLabelText("Email"), "reset@test.com");
    await user.click(screen.getByRole("button", { name: "Forgot password?" }));

    expect(onResetPassword).toHaveBeenCalledTimes(1);
    expect(onResetPassword).toHaveBeenCalledWith("reset@test.com");
  });

  test("displays error/info messages", () => {
    render(
      <LoginForm
        onLogin={jest.fn()}
        onResetPassword={jest.fn()}
        isSubmitting={false}
        error="bad"
        info="ok"
      />
    );

    expect(screen.getByText("bad")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  test("when isSubmitting=true, the submit button is disabled and the label changes", () => {
    render(
      <LoginForm
        onLogin={jest.fn()}
        onResetPassword={jest.fn()}
        isSubmitting={true}
        error=""
        info=""
      />
    );

    const btn = screen.getByRole("button", { name: "Signing in..." });
    expect(btn).toBeDisabled();
  });

  test("Google sign-in: when isNewUser=true, it calls ensureUserProfile", async () => {
    const user = userEvent.setup();

    signInWithPopup.mockResolvedValueOnce({ user: { uid: "u1" } });
    getAdditionalUserInfo.mockReturnValueOnce({ isNewUser: true });

    render(
      <LoginForm
        onLogin={jest.fn()}
        onResetPassword={jest.fn()}
        isSubmitting={false}
        error=""
        info=""
      />
    );

    await user.click(
      screen.getByRole("button", { name: /Continue with Google/i })
    );

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
      expect(ensureUserProfile).toHaveBeenCalledTimes(1);
      expect(ensureUserProfile).toHaveBeenCalledWith({ uid: "u1" });
    });
  });

  test("Google sign-in: when isNewUser=false, it does not call ensureUserProfile", async () => {
    const user = userEvent.setup();

    signInWithPopup.mockResolvedValueOnce({ user: { uid: "u2" } });
    getAdditionalUserInfo.mockReturnValueOnce({ isNewUser: false });

    render(
      <LoginForm
        onLogin={jest.fn()}
        onResetPassword={jest.fn()}
        isSubmitting={false}
        error=""
        info=""
      />
    );

    await user.click(
      screen.getByRole("button", { name: /Continue with Google/i })
    );

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledTimes(1);
      expect(ensureUserProfile).not.toHaveBeenCalled();
    });
  });

  test("Google sign-in failure: it is caught and console.error is called", async () => {
    const user = userEvent.setup();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    signInWithPopup.mockRejectedValueOnce(new Error("popup closed"));

    render(
      <LoginForm
        onLogin={jest.fn()}
        onResetPassword={jest.fn()}
        isSubmitting={false}
        error=""
        info=""
      />
    );

    await user.click(
      screen.getByRole("button", { name: /Continue with Google/i })
    );

    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });
});
