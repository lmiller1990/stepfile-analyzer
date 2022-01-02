import type { PatternBag } from "./patterns";
import type { NoteLine, PatternAnalysis, PatternData } from "./types";

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
  let notePosInMeasure = 1;

  for (const d in lines) {
    const datum = lines[d];

    if (datum === ",") {
      measure++;
      notePosInMeasure = 1;
      newMeasure = true;
      continue;
    }

    if (newMeasure) {
      measureQuantitization = getQuantitization(lines.slice(parseInt(d, 10)));
      newMeasure = false;
    }

    const line: NoteLine = {
      id: (parseInt(d, 10) + 1).toString(),
      notePosInMeasure,
      raw: datum,
      left: datum[0] === "1",
      down: datum[1] === "1",
      up: datum[2] === "1",
      right: datum[3] === "1",
      quantitization: measureQuantitization,
      measure,
    };

    notes.push(line);

    notePosInMeasure++;
  }

  return notes;
}

export const createAnalysisResults = (patterns: PatternBag) => {
  const obj: Record<string, PatternAnalysis> = {};
  for (const key of Object.keys(patterns)) {
    obj[key] = {
      key,
      count: 0,
      collection: new Map(),
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

      // check existing patterns we've encountered
      for (const [k, found] of values[key].collection) {
        if (overlap(pattern[found.noteCheckIndex], note.raw)) {
          const updated: PatternData = {
            ...found,
            noteCheckIndex: found.noteCheckIndex + 1,
            containedNotePositionsInMeasure:
              found.containedNotePositionsInMeasure.concat({
                notePosInMeasure: note.notePosInMeasure,
                measureQuantitization: note.quantitization,
                measureNumber: note.measure,
              }),
          };

          values[key].collection.set(k, updated);

          if (updated.noteCheckIndex === pattern.length) {
            // end of pattern, set completed, increase count
            values[key].collection.set(k, {
              ...values[key].collection.get(k)!,
              completed: true,
            });
            values[key].count++;
          }
        } else if (note.raw === "0000") {
          // do nothing for now, pattern could continue
        } else {
          // abandon pattern if not already found and counted.
          if (!found.completed) {
            values[key].collection.delete(k);
          }
        }
      }

      // current index we are comparing,
      const firstNoteOfPattern = pattern[0];

      // check for start of pattern
      if (overlap(firstNoteOfPattern, note.raw)) {
        values[key].collection.set(note.id, {
          noteCheckIndex: 1,
          completed: false,
          containedNotePositionsInMeasure: [
            {
              notePosInMeasure: note.notePosInMeasure,
              measureQuantitization: note.quantitization,
              measureNumber: note.measure,
            },
          ],
        });
      }
    }
  }

  // clean up
  for (const key of Object.keys(patterns)) {
    // [up, right, left] for example - array of notes
    const pattern = patterns[key];

    for (const [k, found] of values[key].collection) {
      if (found.noteCheckIndex !== pattern.length) {
        values[key].collection.delete(k);
      }
    }
  }

  // finalize
  for (const key of Object.keys(patterns)) {
    for (const [k, found] of values[key].collection) {
      values[key].collection.set(k, {
        ...found,
        quantitization: derivePatternQuantitization(found),
      });
    }
  }

  return values;
}

export function derivePatternQuantitization(
  data: PatternData
): number | undefined {
  let diff: number | undefined;

  for (let i = data.containedNotePositionsInMeasure.length; i > 0; i--) {
    const n2 = data.containedNotePositionsInMeasure[i - 1];
    const n1 = data.containedNotePositionsInMeasure[i - 2];

    if (!n1) {
      return diff;
    }

    // TODO: case of pattern overlapping two measures with diff
    // quantitizations.
    // undefined for now since it's complex.
    if (n2.measureQuantitization !== n1.measureQuantitization) {
      return undefined;
    }

    if (!diff) {
      diff =
        n2.measureQuantitization / (n2.notePosInMeasure - n1.notePosInMeasure);
    } else {
      const nextDiff =
        n2.measureQuantitization / (n2.notePosInMeasure - n1.notePosInMeasure);

      // pattern is not "consistent"
      // eg we might have a 3 note left jack:
      // 1000
      // 1000
      // 0000
      // 1000
      // but it's not really what you'd call a jack - those are supposed to
      // consistently have the same amount of time between each.
      // this is more like a broken 3 left arrow jack, which we don't really care about.
      if (nextDiff !== diff) {
        return undefined;
      }
    }
  }

  return diff;
}
