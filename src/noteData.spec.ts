import { describe, expect, it } from "vitest";
import { highestCommonDenominator } from "./noteData";

describe("highestCommonDenominator", () => {
  it("works", () => {
    const actual = highestCommonDenominator(32, 24)
    expect(actual).toBe(8)
  })

  it("works", () => {
    const actual = highestCommonDenominator(32, 12)
    expect(actual).toBe(4)
  })
})