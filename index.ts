import fs from "fs";
import { get } from "http";
import path from "path";

// const data = fs.readFileSync(path.join(__dirname, "Downfall.ssc"), "utf-8");

export interface NoteLine {
  left: boolean;
  raw: string;
  up: boolean;
  down: boolean;
  right: boolean;
  measure: number;
  quantitization: number; // 4th, 8th etc.
}

function getQuantitization(data: string[]) {
  let count = 0;
  for (const line of data) {
    if (line === ",") {
      return count;
    }
    count++;
  }
  return count;
}

export function parse(data: string) {
  const notes: NoteLine[] = [];
  const lines = data.split("\n");

  let measure = 1;
  let measureQuantitization: number = 0;
  let newMeasure = true;

  for (const d in lines) {
    const datum = lines[d];

    if (datum === ",") {
      measure++;
      newMeasure = true;
      continue;
    }

    if (newMeasure) {
      measureQuantitization = getQuantitization(lines.slice(parseInt(d, 10)));
      newMeasure = false;
    }

    const line: NoteLine = {
      raw: datum,
      left: datum[0] === "1",
      down: datum[1] === "1",
      up: datum[2] === "1",
      right: datum[3] === "1",
      quantitization: measureQuantitization,
      measure,
    };

    notes.push(line);
  }

  return notes;
}

// const patterns =

// const =

export const up = "0010";
export const down = "0100";
export const left = "1000";
export const right = "0001";

export type Note = typeof up | typeof down | typeof right | typeof down;

interface Pattern {
  key: string;
  notes: Note[];
}

const keys = ["urd-candle"] as const;

export type PatternBag = Record<string, readonly Note[]>;

export const patterns: PatternBag = {
  "urd-candle": [up, right, down] as const,
} as const;

export interface PatternAnalysis {
  key: string; // urd-candle, etc
  count: number;
  found: boolean;
  noteCheckIndex: number;
}

export const createAnalysisResults = () => {
  const obj: Record<string, PatternAnalysis> = {};
  for (const key of Object.keys(patterns)) {
    obj[key] = {
      key,
      count: 0,
      found: false,
      noteCheckIndex: 1,
    };
  }
  return obj;
};

// bitwise operators
// eg if we have 1110 and are looking to see if it contains 0100
// 1110 & 0100 => 0100, then see if result === original
// 0100 === 0100 => contains
export function overlap(target: string, line: string) {
  const t = parseInt(target, 2);
  const l = parseInt(line, 2);
  return (l & t) === t;
}

export function analyzePatterns(
  values: Record<string, PatternAnalysis>,
  notes: NoteLine[]
) {
  for (const note of notes) {
    for (const key of keys) {
      // [up, right, left] for example - array of notes
      const pattern = patterns[key];

      // current index we are comparing,
      const compare = patterns[key][values[key].noteCheckIndex];

      if (overlap(compare, note.raw)) {
        values[key].found = true;
        values[key].noteCheckIndex++;

        // done!
        if (values[key].noteCheckIndex === pattern.length) {
          values[key].count++;

          // reset
          values[key].found = false;
          values[key].noteCheckIndex = 1;
        }
      } else {
        values[key].found = false;
        values[key].noteCheckIndex = 1;
      }
    }
  }

  return values;
}
