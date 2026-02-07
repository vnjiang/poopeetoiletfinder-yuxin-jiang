// src/services/__tests__/apiClient.test.js
const mockRequestUse = jest.fn();
const mockResponseUse = jest.fn();

const mockInstance = {
  interceptors: {
    request: { use: mockRequestUse },
    response: { use: mockResponseUse },
  },
};

const mockCreate = jest.fn(() => mockInstance);

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    create: mockCreate,
  },
}));

describe("apiClient", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  function setupAxiosMock() {
    jest.doMock("axios", () => {
      const mockApi = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      };

      return {
        __esModule: true,
        default: {
          create: jest.fn(() => mockApi),
        },
        __mockApi: mockApi,
      };
    });
  }

  test("axios.create is called with baseURL and timeout", async () => {
    setupAxiosMock();
    const axiosMod = await import("axios");
    const axios = axiosMod.default;

    const apiClient = (await import("../apiClient")).default;

    expect(axios.create).toHaveBeenCalledTimes(1);
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: "http://localhost:5007/routes",
      timeout: 10000,
    });

    expect(apiClient).toBeDefined();
    expect(apiClient.interceptors).toBeDefined();
  });

  test("request interceptor returns config and ensures headers exists", async () => {
    setupAxiosMock();
    const axiosMod = await import("axios");
    const { __mockApi } = axiosMod;

    await import("../apiClient");

    expect(__mockApi.interceptors.request.use).toHaveBeenCalledTimes(1);

    const onFulfilled = __mockApi.interceptors.request.use.mock.calls[0][0];

    const cfg1 = onFulfilled({});
    expect(cfg1.headers).toBeDefined();

    const cfg2 = onFulfilled({ headers: { a: 1 } });
    expect(cfg2.headers).toEqual({ a: 1 });
  });

  test("response interceptor returns response.data", async () => {
    setupAxiosMock();
    const axiosMod = await import("axios");
    const { __mockApi } = axiosMod;

    await import("../apiClient");

    expect(__mockApi.interceptors.response.use).toHaveBeenCalledTimes(1);

    const onFulfilled = __mockApi.interceptors.response.use.mock.calls[0][0];
    const data = onFulfilled({ data: { ok: 1 } });
    expect(data).toEqual({ ok: 1 });
  });

  test("response interceptor rejects error and logs", async () => {
    setupAxiosMock();
    const axiosMod = await import("axios");
    const { __mockApi } = axiosMod;

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    await import("../apiClient");

    const onRejected = __mockApi.interceptors.response.use.mock.calls[0][1];

    const err = new Error("boom");
    await expect(onRejected(err)).rejects.toBe(err);
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
