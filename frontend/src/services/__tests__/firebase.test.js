// src/services/__tests__/firebase.test.js

jest.mock("firebase/app", () => ({
  __esModule: true,
  initializeApp: jest.fn(() => ({ __app: true })),
}));

jest.mock("firebase/auth", () => ({
  __esModule: true,
  getAuth: jest.fn(() => ({ __auth: true })),
  GoogleAuthProvider: jest.fn(() => ({ __provider: true })),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  __esModule: true,
  getFirestore: jest.fn(() => ({ __db: true })),

  collection: jest.fn(),
  addDoc: jest.fn(),
}));

describe("firebase service module", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("initializeApp/getAuth/getFirestore/GoogleAuthProvider are called and exports exist", async () => {
    const { initializeApp } = await import("firebase/app");
    const { getAuth, GoogleAuthProvider } = await import("firebase/auth");
    const { getFirestore } = await import("firebase/firestore");

    const mod = await import("../firebase");

    expect(initializeApp).toHaveBeenCalledTimes(1);
    expect(getAuth).toHaveBeenCalledTimes(1);
    expect(getFirestore).toHaveBeenCalledTimes(1);
    expect(GoogleAuthProvider).toHaveBeenCalledTimes(1);
    expect(mod.auth).toBeDefined();
    expect(mod.db).toBeDefined();
    expect(mod.googleProvider).toBeDefined();
  });
});
