import { describe, it, expect } from "vitest";

import {
  Measure,
  NoteLine,
  NoteLineWithPatternData,
  PatternData,
} from "./types";
import {
  addPatternDataToMeasures,
  analyzePatterns,
  createAnalysisResults,
  createVirtualizedMeasure,
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

    expect(actual.lines).toMatchSnapshot();
    expect(actual.measures).toMatchSnapshot();
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
    const { lines, measures } = parse(data);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
    };

    const analysis = createAnalysisResults(patterns);

    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["urd-candle"].count).toBe(1);
    expect(actual["urd-candle"].count).toBe(1);

    const pattern = actual["urd-candle"].collection.get("1")!;

    expect(pattern.patternQuantitization).toBe(4);
  });
})

  it("works across measures with same quantitization", () => {
    const data = `0000
    0000
    0010
    0001
    ,
    0100
    0000
    0000
    0000
    ,`;

    const { lines, measures } = parse(data);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
    };

    const analysis = createAnalysisResults(patterns);

    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["urd-candle"].count).toBe(1);
    expect(actual["urd-candle"].count).toBe(1);

    const pattern = actual["urd-candle"].collection.get("3")!;

    expect(pattern.patternQuantitization).toBe(4);
  });

  it.skip("works across measures with different quantitization, m1 > m2", () => {
    const data = `0000
    0000
    0000
    0000
    0000
    0000
    0010
    0001
    ,
    0100
    0000
    0000
    0000
    ,`;

    const { lines, measures } = parse(data);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
    };

    const analysis = createAnalysisResults(patterns);

    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["urd-candle"].count).toBe(1);
    expect(actual["urd-candle"].count).toBe(1);

    const pattern = actual["urd-candle"].collection.get("7")!;

    expect(pattern.patternQuantitization).toBe(8);
  });

  it("works across measures with different quantitization, m1 < m2", () => {
    const data = `0000
    0000
    0010
    0001
    ,
    0100
    0000
    0000
    0000
    0000
    0000
    0000
    0000
    ,`;

    const { lines, measures } = parse(data);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
    };

    const analysis = createAnalysisResults(patterns);

    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["urd-candle"].count).toBe(1);
    expect(actual["urd-candle"].count).toBe(1);

    const pattern = actual["urd-candle"].collection.get("3")!;

    expect(pattern.patternQuantitization).toBe(4);
  });

  it("detects uneven pattern, m1 > m2", () => {
    const data = `0000
    0000
    0000
    0000
    0000
    0000
    0010
    0001
    ,
    0000
    0100
    0000
    0000
    ,`;

    const { lines, measures } = parse(data);

    const patterns: PatternBag = {
      "urd-candle": [up, right, down],
    };

    const analysis = createAnalysisResults(patterns);

    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["urd-candle"].count).toBe(1);
    expect(actual["urd-candle"].count).toBe(1);

    const pattern = actual["urd-candle"].collection.get("7")!;

    expect(pattern.patternQuantitization).toBe(0);
  });

  it("detects uneven pattern, m1 < m2", () => {
    const data = `0000
    0000
    0000
    0001
    ,
    0001
    0000
    0001
    0000
    0001
    0000
    0000
    0000
    ,`;

    const { lines, measures } = parse(data);

    const patterns: PatternBag = {
      "rrrr-jack": [right, right, right, right],
    };

    const analysis = createAnalysisResults(patterns);

    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["rrrr-jack"].count).toBe(1);
    expect(actual["rrrr-jack"].count).toBe(1);

    const pattern = actual["rrrr-jack"].collection.get("4")!;

    expect(pattern.patternQuantitization).toBe(4);
  });

  it("double taps", () => {
    const { lines, measures } = parse(`1000
1000
1000
1000
,`);

    const patterns: PatternBag = {
      ll: [left, left],
    };

    const analysis = createAnalysisResults(patterns);
    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["ll"].count).toBe(3);
  });

//   // HERE
//   it("sweep pattern across measures", () => {
//     const chart = `0000
// 0000
// 0000
// 0000
// 0000
// 0000
// 1000
// 0100
// ,  // measure 3
// 0010
// 0000
// 0001
// 0000
// 1000
// 0010
// 0100
// 0001
// 0010
// 0100
// 0001
// 0010
// 1000
// 0001
// 1000
// 0001
// ,`;
//     const { lines, measures } = parse(chart);

//     const k = "ldur-sweep";
//     const patterns: PatternBag = {
//       [k]: [left, down, up, right],
//     };

//     const analysis = createAnalysisResults(patterns);

//     const actual = analyzePatterns(analysis, lines, measures, patterns);

//     expect(actual[k].count).toBe(1);
//     expect(actual[k].count).toBe(1);

//     const pattern = actual[k].collection.get("7")!;

//     expect(pattern.patternQuantitization).toBe(8);
//   });

  it("quantitization", () => {
    const { lines, measures } = parse(`1000
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
    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual["ll"].count).toBe(5);
    expect(actual["lll"].count).toBe(4);
    expect(actual["llll"].count).toBe(3);
  });

  it("16th candles", () => {
    const { lines, measures } = parse(`0010
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
    const actual = analyzePatterns(analysis, lines, measures, patterns);

    expect(actual).toMatchSnapshot();
  });
// });

describe("addPatternDataToMeasures", () => {
  it("adds pattern metadata to notes in measures", () => {
    const { lines, measures } = parse(`0000
0010
1000
0100
,`);

    const patterns: PatternBag = {
      "uld-candle": [up, left, down],
    };

    const analysis = createAnalysisResults(patterns);
    const data = analyzePatterns(analysis, lines, measures, patterns);

    const actual = addPatternDataToMeasures(measures, data);
    const expected: Measure<NoteLineWithPatternData>[] = [
      {
        notes: [
          { ...lines[0], patterns: new Map() },
          { ...lines[1], patterns: new Map([["uld-candle", 4]]) },
          { ...lines[2], patterns: new Map([["uld-candle", 4]]) },
          { ...lines[3], patterns: new Map([["uld-candle", 4]]) },
        ],
        quantitization: 4,
        number: 1,
      },
    ];

    expect(actual).toEqual(expected);
  });
});

describe("getQuantitization", () => {
  it("4ths", () => {
    const { lines } = parse(`0000
0010
1000
0100
,`);

    expect(lines[0].measureQuantitization).toBe(4);
    expect(lines[0].noteQuantitization).toBe(4);
    expect(lines[1].measureQuantitization).toBe(4);
    expect(lines[1].noteQuantitization).toBe(4);
    expect(lines[2].measureQuantitization).toBe(4);
    expect(lines[2].noteQuantitization).toBe(4);
    expect(lines[3].measureQuantitization).toBe(4);
    expect(lines[3].noteQuantitization).toBe(4);
  });

  it("8ths", () => {
    const { lines } = parse(`0000
0000
0000
0000
0000
0000
0000
0000
,`);

    expect(lines[0].noteQuantitization).toBe(4);
    expect(lines[1].noteQuantitization).toBe(8);

    expect(lines[2].noteQuantitization).toBe(4);
    expect(lines[3].noteQuantitization).toBe(8);

    expect(lines[4].noteQuantitization).toBe(4);
    expect(lines[5].noteQuantitization).toBe(8);

    expect(lines[6].noteQuantitization).toBe(4);
    expect(lines[7].noteQuantitization).toBe(8);
  });
});

describe("createVirtualizedMeasure", () => {
  it("m1.quantization less than m2", () => {
    const actual = createVirtualizedMeasure(
      [1, 2],
      [
        {
          notePosInMeasure: 7,
          measureQuantitization: 8,
          noteQuantitization: 4,
          measureNumber: 1,
        },
        {
          notePosInMeasure: 8,
          measureQuantitization: 8,
          noteQuantitization: 8,
          measureNumber: 1,
        },
        {
          notePosInMeasure: 1,
          measureQuantitization: 16,
          noteQuantitization: 4,
          measureNumber: 2,
        },
        {
          notePosInMeasure: 3,
          measureQuantitization: 16,
          noteQuantitization: 8,
          measureNumber: 2,
        },
        {
          notePosInMeasure: 5,
          measureQuantitization: 16,
          noteQuantitization: 8,
          measureNumber: 2,
        },
        {
          notePosInMeasure: 7,
          measureQuantitization: 16,
          noteQuantitization: 8,
          measureNumber: 2,
        },
      ]
    );

    expect(actual[0].notePosInMeasure).toBe(7);
    expect(actual[1].notePosInMeasure).toBe(8);
    expect(actual[2].notePosInMeasure).toBe(9);
    expect(actual[3].notePosInMeasure).toBe(10);
    expect(actual[4].notePosInMeasure).toBe(11);
    expect(actual[5].notePosInMeasure).toBe(12);
  });
});
