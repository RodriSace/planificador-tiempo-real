import { describe, expect, it } from "vitest";
import { gcd, hyperperiod, lcm } from "./math";

describe("math", () => {
  it("gcd", () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 5)).toBe(1);
    expect(gcd(0, 9)).toBe(9);
  });

  it("lcm", () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 5)).toBe(15);
  });

  it("hyperperiod", () => {
    expect(hyperperiod([4, 8, 16])).toBe(16);
    expect(hyperperiod([5, 10, 20])).toBe(20);
    expect(hyperperiod([3, 4, 5])).toBe(60);
    expect(hyperperiod([7])).toBe(7);
  });
});
