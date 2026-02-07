import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthContextProvider, useAuth } from "../authContext";

let mockAuth;
let authStateCb;
let unsubscribeMock;


jest.mock("../../services/firebase", () => {
  let authStateCb;
  const unsubscribeMock = jest.fn();
  
  return {
    auth: {
      onAuthStateChanged: jest.fn((cb) => {
        authStateCb = cb;
        return unsubscribeMock;
      }),
      currentUser: null,
    }
  };
});

const mockSignOut = jest.fn(() => Promise.resolve());
jest.mock("firebase/auth", () => ({
  signOut: (...args) => mockSignOut(...args),
}));

const mockFetchUserRole = jest.fn();
jest.mock("../../utils/role", () => ({
  fetchUserRole: (...args) => mockFetchUserRole(...args),
}));



beforeAll(() => {
  const firebaseMock = require("../../services/firebase");
  mockAuth = firebaseMock.auth;

  const originalOnAuthStateChanged = mockAuth.onAuthStateChanged;
  mockAuth.onAuthStateChanged.mockImplementation((cb) => {
    const unsubscribe = jest.fn();
    authStateCb = cb;
    unsubscribeMock = unsubscribe;
    return unsubscribe;
  });
});

function Consumer() {
  const { user, role, loading, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="role">{String(role)}</div>
      <div data-testid="user">{user ? "yes" : "no"}</div>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContextProvider smoke", () => {
  beforeEach(() => {

    jest.clearAllMocks();
    mockSignOut.mockClear();
    mockFetchUserRole.mockClear();
    authStateCb = undefined;
    unsubscribeMock = jest.fn();
    
    if (mockAuth) {
      mockAuth.onAuthStateChanged.mockImplementation((cb) => {
        authStateCb = cb;
        return unsubscribeMock;
      });
    }
  });

  test("initially loading=true; when currentUser=null arrives => role=user and loading=false", async () => {
    render(
      <AuthContextProvider>
        <Consumer />
      </AuthContextProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    await act(async () => {
      if (authStateCb) {
        authStateCb(null);
      }
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("role")).toHaveTextContent("user");
    expect(screen.getByTestId("user")).toHaveTextContent("no");
    expect(mockFetchUserRole).not.toHaveBeenCalled();
  });

  test("when currentUser arrives => fetchUserRole(uid) is called and role is set", async () => {
    mockFetchUserRole.mockResolvedValueOnce("commercial_owner");

    render(
      <AuthContextProvider>
        <Consumer />
      </AuthContextProvider>
    );

    const currentUser = { uid: "u1", email: "a@test.com" };

    await act(async () => {
      if (authStateCb) {
        authStateCb(currentUser);
      }
    });

    expect(mockFetchUserRole).toHaveBeenCalledTimes(1);
    expect(mockFetchUserRole).toHaveBeenCalledWith("u1");
    expect(screen.getByTestId("role")).toHaveTextContent("commercial_owner");
    expect(screen.getByTestId("user")).toHaveTextContent("yes");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  test("logout() calls signOut(auth)", async () => {
    const user = userEvent.setup();

    render(
      <AuthContextProvider>
        <Consumer />
      </AuthContextProvider>
    );

    await user.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
  });

  test("unmount unsubscribes from onAuthStateChanged", () => {
    const { unmount } = render(
      <AuthContextProvider>
        <Consumer />
      </AuthContextProvider>
    );

    unmount();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});