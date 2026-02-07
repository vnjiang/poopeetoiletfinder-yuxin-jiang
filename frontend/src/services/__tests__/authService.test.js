// src/services/__tests__/authService.test.js


jest.mock("../firebase", () => ({
  __esModule: true,
  auth: { __tag: "auth" },
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
  auth,
} from "../firebase";

import { loginWithEmail, resetPassword, registerWithEmail } from "../authService";

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loginWithEmail success -> ok true + user", async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: "u1" } });

    const res = await loginWithEmail("a@test.com", "123456");

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, "a@test.com", "123456");
    expect(res).toEqual({ ok: true, user: { uid: "u1" } });
  });

  test("loginWithEmail invalid-email -> mapped message", async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce({ code: "auth/invalid-email" });

    const res = await loginWithEmail("bad", "123");

    expect(res.ok).toBe(false);
    expect(res.message).toBe("Invalid email address.");
  });

  test("resetPassword passes url option", async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();

    const res = await resetPassword("a@test.com", "http://return");

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, "a@test.com", {
      url: "http://return",
    });
    expect(res).toEqual({ ok: true });
  });

  test("registerWithEmail success -> calls updateProfile(displayName)", async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: "u2" } });
    updateProfile.mockResolvedValueOnce();

    const res = await registerWithEmail("a@test.com", "123456", "Jack");

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, "a@test.com", "123456");
    expect(updateProfile).toHaveBeenCalledWith({ uid: "u2" }, { displayName: "Jack" });
    expect(res).toEqual({ ok: true, user: { uid: "u2" } });
  });

  test("registerWithEmail error -> returns ok false + code", async () => {
    createUserWithEmailAndPassword.mockRejectedValueOnce({ code: "auth/email-already-in-use" });

    const res = await registerWithEmail("a@test.com", "123456", "Jack");

    expect(res).toEqual({ ok: false, code: "auth/email-already-in-use" });
  });
});
