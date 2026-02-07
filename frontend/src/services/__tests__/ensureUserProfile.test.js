import { ensureUserProfile } from "../ensureUserProfile";
import { updateProfile } from "firebase/auth";

jest.mock("firebase/auth", () => ({
  updateProfile: jest.fn(),
}));

describe("ensureUserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("when user is null: returns immediately and does not call updateProfile", async () => {
    await ensureUserProfile(null);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  test("when user already has displayName: does not call updateProfile", async () => {
    const user = { uid: "abcdef123456", displayName: "Tom", email: "tom@test.com" };
    await ensureUserProfile(user);
    expect(updateProfile).not.toHaveBeenCalled();
  });

  test("when email exists but displayName is missing: uses email prefix as displayName", async () => {
    const user = { uid: "abcdef123456", displayName: "", email: "john.doe@test.com" };
    await ensureUserProfile(user);

    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: "john.doe" });
  });

  test("when email is missing and displayName is missing: falls back to User-<first 6 chars of uid>", async () => {
    const user = { uid: "xyz987654321", displayName: "" };
    await ensureUserProfile(user);

    expect(updateProfile).toHaveBeenCalledTimes(1);
    expect(updateProfile).toHaveBeenCalledWith(user, { displayName: "User-xyz987" });
  });
});
