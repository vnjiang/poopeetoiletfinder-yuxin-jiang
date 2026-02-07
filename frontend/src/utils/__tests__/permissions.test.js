// src/utils/__tests__/permissions.test.js
import { isAdminUser } from "../permissions";
import { isAdminByEmail } from "../../config/adminConfig";

jest.mock("../../config/adminConfig", () => ({
  isAdminByEmail: jest.fn(),
}));

describe("isAdminUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("no user -> false", () => {
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });

  test("no email -> false", () => {
    expect(isAdminUser({ uid: "1" })).toBe(false);
  });

  test("admin email -> true", () => {
    isAdminByEmail.mockReturnValueOnce(true);
    expect(isAdminUser({ email: "admin@test.com" })).toBe(true);
  });

  test("normal email -> false", () => {
    isAdminByEmail.mockReturnValueOnce(false);
    expect(isAdminUser({ email: "user@test.com" })).toBe(false);
  });
});
