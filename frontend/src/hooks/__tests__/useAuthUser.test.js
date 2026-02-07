import { renderHook, act } from "@testing-library/react";
import { useAuthUser } from "../useAuthUser";


jest.mock("../../services/firebase", () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}));

import { auth } from "../../services/firebase";

describe("useAuthUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("subscribes to onAuthStateChanged on mount and updates user", () => {
    const unsubscribe = jest.fn();

    let listener;
    auth.onAuthStateChanged.mockImplementation((cb) => {
      listener = cb;
      return unsubscribe;
    });

    const { result, unmount } = renderHook(() => useAuthUser());

    expect(result.current).toBe(null);
    expect(auth.onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(typeof listener).toBe("function");

    act(() => {
      listener({ uid: "u1", email: "a@test.com" });
    });

    expect(result.current).toEqual({ uid: "u1", email: "a@test.com" });

    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
