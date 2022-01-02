import { describe, it, expect } from "vitest";

import { NoteLine } from "./types";
import {
  analyzePatterns,
  createAnalysisResults,
  overlap,
  parse,
} from "./analysis";
import { down, right, up, PatternBag, left } from "./patterns";

const data = `0010
0001
0100
0000
,
0000
0000
0000
0000
0000
0000
0000
0000
,`;

describe("parse", () => {
  it("works", () => {
    const actual = parse(data);
    const empty = (measure: number): NoteLine => ({
      left: false,
      down: false,
      quantitization: 8,
      raw: "0000",
      up: false,
      right: false,
      measure,
    });

    const expected: NoteLine[] = [
      {
        left: false,
        down: false,
        up: true,
        raw: "0010",
        right: false,
        measure: 1,
        quantitization: 4,
      },
      {
        left: false,
        down: false,
        raw: "0001",
        up: false,
        right: true,
        measure: 1,
        quantitization: 4,
      },
      {
        left: false,
        down: true,
        up: false,
        raw: "0100",
        right: false,
        measure: 1,
        quantitization: 4,
      },
      {
        raw: "0000",
        left: false,
        down: false,
        up: false,
        right: false,
        measure: 1,
        quantitization: 4,
      },
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
    ];

    expect(actual).toEqual(expected);
  });
});

describe("overlap", () => {
  it("works", () => {
    expect(overlap("1000", "1000")).toBe(true);
  });

  it("works", () => {
    expect(overlap("1100", "1110")).toBe(true);
  });
});

describe("analyzePatterns", () => {
  it("works", () => {
    const data = `0010
    0001
    0100
    0000
    ,`;
    const lines = parse(data);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
    };

    const analysis = createAnalysisResults(patterns);


    const actual = analyzePatterns(analysis, lines, patterns);

    expect(actual).toEqual({
      "urd-candle": {
        key: "urd-candle",
        count: 1,
        noteCheckIndex: 0,
      },
    });
  });

  it.only("double taps", () => {
    const data = `1000
1000
1000
1000
,`;

    const lines = parse(data);
    const patterns: PatternBag = {
      "ll": [left, left],
    };

    const analysis = createAnalysisResults(patterns);
    const actual = analyzePatterns(analysis, lines, patterns);

    expect(actual["ll"].count).toBe(3)
  });
});
