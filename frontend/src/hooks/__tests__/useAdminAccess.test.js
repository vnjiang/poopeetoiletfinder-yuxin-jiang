import { renderHook } from "@testing-library/react";
import { useAdminAccess } from "../useAdminAccess";
import { useAuth } from "../../context/authContext";

jest.mock("../../context/authContext", () => ({
  useAuth: jest.fn(),
}));


describe("useAdminAccess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("passes through loading state", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    const { result } = renderHook(() => useAdminAccess());
    expect(result.current.loading).toBe(true);
  });

  test("when user is null -> isAdmin=false", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useAdminAccess());
    expect(result.current.isAdmin).toBe(false);
  });

  test("admin email match -> isAdmin=true", () => {
    useAuth.mockReturnValue({
      user: { email: "jiangyuxin0326@gmail.com" },
      loading: false,
    });

    const { result } = renderHook(() => useAdminAccess());
    expect(result.current.isAdmin).toBe(true);
  });
  
  test("non-admin email -> isAdmin=false", () => {
    useAuth.mockReturnValue({
      user: { email: "user@test.com" },
      loading: false,
    });

    const { result } = renderHook(() => useAdminAccess());
    expect(result.current.isAdmin).toBe(false);
  });
});
