import { mapAuthError } from "../authErrorMapper";

describe("mapAuthError", () => {
  test("known firebase code", () => {
    expect(mapAuthError("auth/invalid-email")).toBe("Invalid email address");
  });

  test("unknown code -> default message", () => {
    expect(mapAuthError("some-unknown")).toBe("Something went wrong. Please try again.");
  });

  test("empty -> default message", () => {
    expect(mapAuthError("")).toBe("Something went wrong. Please try again.");
    expect(mapAuthError()).toBe("Something went wrong. Please try again.");
  });
});
