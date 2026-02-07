// src/utils/__tests__/priceLabel.test.js
import { getFeeLabel } from "../priceLabel";

describe("getFeeLabel (by toilet.type + price)", () => {
  test("null/undefined -> N/A", () => {
    expect(getFeeLabel(null)).toBe("N/A");
    expect(getFeeLabel(undefined)).toBe("N/A");
  });

  test("missing/unknown type -> N/A", () => {
    expect(getFeeLabel({})).toBe("N/A");
    expect(getFeeLabel({ type: "unknown" })).toBe("N/A");
  });

  test("type=free -> Free", () => {
    expect(getFeeLabel({ type: "free" })).toBe("Free");
  });

  test("type=free for customer -> Free for customer", () => {
    expect(getFeeLabel({ type: "free for customer" })).toBe("Free for customer");
  });

  test("type=paid + price -> returns price", () => {
    expect(getFeeLabel({ type: "paid", price: "Paid: €10" })).toBe("Paid: €10");
    expect(getFeeLabel({ type: "paid", price: "€10" })).toBe("€10");
  });

  test("type=paid but no price -> Paid", () => {
    expect(getFeeLabel({ type: "paid" })).toBe("Paid");
    expect(getFeeLabel({ type: "paid", price: "" })).toBe("Paid");
  });
});
