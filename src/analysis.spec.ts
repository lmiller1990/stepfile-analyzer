import { describe, it, expect } from "vitest";

import { NoteLine, PatternData } from "./types";
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
    let id = 4;
    let pos = 0;
    const empty = (measure: number): NoteLine => {
      id++;
      pos++;

      return {
        notePosInMeasure: pos,
        id: id.toString(),
        left: false,
        down: false,
        quantitization: 8,
        raw: "0000",
        up: false,
        right: false,
        measure,
      };
    };

    const m1: NoteLine[] = [
      {
        id: "1",
        notePosInMeasure: 1,
        left: false,
        down: false,
        up: true,
        raw: "0010",
        right: false,
        measure: 1,
        quantitization: 4,
      },
      {
        id: "2",
        notePosInMeasure: 2,
        left: false,
        down: false,
        raw: "0001",
        up: false,
        right: true,
        measure: 1,
        quantitization: 4,
      },
      {
        id: "3",
        notePosInMeasure: 3,
        left: false,
        down: true,
        up: false,
        raw: "0100",
        right: false,
        measure: 1,
        quantitization: 4,
      },
      {
        id: "4",
        notePosInMeasure: 4,
        raw: "0000",
        left: false,
        down: false,
        up: false,
        right: false,
        measure: 1,
        quantitization: 4,
      },
    ];

    const m2: NoteLine[] = [
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
      empty(2),
    ];

    const expected: NoteLine[] = [...m1, ...m2];

    const actual = parse(data);

    expect(actual.lines).toEqual(expected);
    expect(actual.measures).toEqual([
      {
        notes: m1,
        number: 1,
        quantitization: 4,
      },
      {
        notes: m2,
        number: 2,
        quantitization: 8,
      },
    ]);

    expect(actual).toMatchSnapshot()
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
    const { lines } = parse(data);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
    };

    const analysis = createAnalysisResults(patterns);

    const actual = analyzePatterns(analysis, lines, patterns);

    expect(actual["urd-candle"].count).toBe(1);
  });

  it("double taps", () => {
    const { lines } = parse(`1000
1000
1000
1000
,`);

    const patterns: PatternBag = {
      ll: [left, left],
    };

    const analysis = createAnalysisResults(patterns);
    const actual = analyzePatterns(analysis, lines, patterns);

    expect(actual["ll"].count).toBe(3);
  });

  it("quantitization", () => {
    const { lines } = parse(`1000
0000
1000
0000
1000
1000
1000
1000
,`);

    const patterns: PatternBag = {
      ll: [left, left],
      lll: [left, left, left],
      llll: [left, left, left, left],
    };

    const analysis = createAnalysisResults(patterns);
    const actual = analyzePatterns(analysis, lines, patterns);

    expect(actual["ll"].count).toBe(5);
    expect(actual["lll"].count).toBe(4);
    expect(actual["llll"].count).toBe(3);
  });

  it.skip("adds quantitization to pattern", () => {
    const { lines } = parse(`1000
0000
1000
0000
,`);

    const patterns: PatternBag = {
      ll: [left, left],
    };

    const analysis = createAnalysisResults(patterns);
    const actual = analyzePatterns(analysis, lines, patterns);

    const identifiedPattern = actual["ll"].collection.get("1")!;

    expect(actual["ll"].count).toBe(1);
    expect(identifiedPattern.containedNotePositionsInMeasure).toEqual([
      {
        notePosInMeasure: 1,
        measureQuantitization: 4,
        measureNumber: 1,
      },
      {
        notePosInMeasure: 3,
        measureQuantitization: 4,
        measureNumber: 1,
      },
    ]);
  });

  it("16th candles", () => {
    const { lines } = parse(`0010
0001
0100
0010
1000
0100
1000
0010
0100
0001
0010
0000
0000
0000
0000
0000
,`);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
      "uld-candle": [up, left, down],
      "dlu-candle": [down, left, up],
      "dru-candle": [down, right, up],
    };

    const analysis = createAnalysisResults(patterns);
    const actual = analyzePatterns(analysis, lines, patterns);

    expect(actual).toMatchSnapshot();
  });
});
