import type { PatternBag } from "./patterns";
import type { NoteLine, PatternAnalysis } from "./types";

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

export const createAnalysisResults = (patterns: PatternBag) => {
  const obj: Record<string, PatternAnalysis> = {};
  for (const key of Object.keys(patterns)) {
    obj[key] = {
      key,
      count: 0,
      found: false,
      noteCheckIndex: 0,
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
  notes: NoteLine[],
  patterns: PatternBag
) {
  for (const note of notes) {
    for (const key of Object.keys(patterns)) {
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
          values[key].noteCheckIndex = 0;
        }
      } else {
        values[key].found = false;
        values[key].noteCheckIndex = 0;
      }
    }
  }

  return values;
}
