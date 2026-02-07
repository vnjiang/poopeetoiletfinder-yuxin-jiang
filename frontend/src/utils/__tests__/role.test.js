import { fetchUserRole } from "../role";

// mock firestore + db
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock("../../services/firebase", () => ({
  db: { __mock: true },
}));

import { doc, getDoc } from "firebase/firestore";

describe("fetchUserRole", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("empty uid -> returns 'user'", async () => {
    await expect(fetchUserRole("")).resolves.toBe("user");
    await expect(fetchUserRole(null)).resolves.toBe("user");
    await expect(fetchUserRole(undefined)).resolves.toBe("user");
    expect(getDoc).not.toHaveBeenCalled();
  });

  test("roles doc does not exist -> returns 'user'", async () => {
    doc.mockReturnValue({ __ref: true });
    getDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    });

    await expect(fetchUserRole("uid1")).resolves.toBe("user");
    expect(doc).toHaveBeenCalled();
    expect(getDoc).toHaveBeenCalled();
  });

  test("roles doc exists and has role -> returns role", async () => {
    doc.mockReturnValue({ __ref: true });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ role: "admin" }),
    });

    await expect(fetchUserRole("uid1")).resolves.toBe("admin");
  });

  test("roles doc exists but role is missing -> returns 'user'", async () => {
    doc.mockReturnValue({ __ref: true });
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({}),
    });

    await expect(fetchUserRole("uid1")).resolves.toBe("user");
  });
});
