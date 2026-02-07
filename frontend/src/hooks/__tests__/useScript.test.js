// src/hooks/useScript.test.js
import { renderHook, act, waitFor } from "@testing-library/react";
import useScript from "../useScript";

describe("useScript", () => {
  const SRC = "https://example.com/test.js";

  beforeEach(() => {

    document.querySelectorAll(`script[src="${SRC}"]`).forEach((n) => n.remove());
  });

  test("If the script already exists: returns loaded=true and error=false", async () => {

    const s = document.createElement("script");
    s.src = SRC;
    document.body.appendChild(s);

    const { result } = renderHook(() => useScript(SRC));

    await waitFor(() => {
      expect(result.current[0]).toBe(true);  
      expect(result.current[1]).toBe(false); 
    });
  });

  test("If the script does not exist: creates it, then onload sets loaded=true and error=false", async () => {

    let createdScript = null;

    const appendSpy = jest
      .spyOn(document.body, "appendChild")
      .mockImplementation((node) => {
        createdScript = node;
        return HTMLElement.prototype.appendChild.call(document.body, node);
      });

    const { result } = renderHook(() => useScript(SRC));

    await waitFor(() => {
      expect(createdScript).toBeTruthy();
      expect(createdScript.tagName).toBe("SCRIPT");
      expect(createdScript.src).toContain(SRC);
    });

    act(() => {
      createdScript.onload && createdScript.onload();
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
      expect(result.current[1]).toBe(false);
    });

    appendSpy.mockRestore();
  });

  test("On error: loaded=true and error=true", async () => {

    let createdScript = null;

    const appendSpy = jest
      .spyOn(document.body, "appendChild")
      .mockImplementation((node) => {
        createdScript = node;
        return HTMLElement.prototype.appendChild.call(document.body, node);
      });

    const { result } = renderHook(() => useScript(SRC));

    await waitFor(() => {
      expect(createdScript).toBeTruthy();
    });

    act(() => {
      createdScript.onerror && createdScript.onerror();
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(true);
      expect(result.current[1]).toBe(true);
    });

    appendSpy.mockRestore();
  });
});
