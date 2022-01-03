import { isNumberObject } from "util/types";
import { PatternBag, up } from "./patterns";
import { ContainedNote, NoteLine, PatternAnalysis, PatternData } from "./types";

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
    const datum = lines[d].trim();

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
  const { smallestQuantitization, largestQuantitization } =
    data.containedNotePositionsInMeasure.reduce(
      (acc, curr) => {
        if (curr.measureQuantitization > acc.smallestQuantitization) {
          acc.largestQuantitization = curr.measureQuantitization;
        }

        if (curr.measureQuantitization < acc.smallestQuantitization) {
          acc.smallestQuantitization = curr.measureQuantitization;
        }

        return acc;
      },
      {
        smallestQuantitization: Number.POSITIVE_INFINITY,
        largestQuantitization: 0,
      }
    );

  // eg 11 and 12, etc.
  // these will always be 1 whole number different, we don't
  // care about a pattern that spans more than two measures.
  const uniqMeasureNumbers = data.containedNotePositionsInMeasure.reduce<
    Array<{ quan: number; measureNumber: number }>
  >((acc, curr) => {
    if (acc.some((x) => x.measureNumber === curr.measureNumber)) {
      return acc;
    }
    return acc.concat({
      measureNumber: curr.measureNumber,
      quan: curr.measureQuantitization,
    });
  }, []);

  // change measures 12 and 13 to 1 and 2 for convinience.
  let notes = data.containedNotePositionsInMeasure.map<
    ContainedNote & { shouldNormalize: boolean; id: number }
  >((x, id) => {
    return {
      ...x,
      id,
      measureNumber:
        x.measureNumber === uniqMeasureNumbers[0].measureNumber ? 1 : 2,
      shouldNormalize: x.measureQuantitization === largestQuantitization,
    };
  });

  // eg 16/8 = 2
  const divisor = largestQuantitization / smallestQuantitization;

  // 0, 2, 4, 6, 8, 10, 12, 14
  const positions: number[] = [];
  for (let j = 0; j < largestQuantitization / divisor; j++) {
    const notePosToModify = j * divisor + 1;
    positions.push(notePosToModify);
  }

  const updatedNotes: typeof notes = [];

  for (const pos of positions) {
    const notePosToModify = pos; // j * divisor + 1;
    const noteToNormalize = notes.find((x) => {
      return x.shouldNormalize && x.notePosInMeasure === notePosToModify;
    });

    if (!noteToNormalize) {
      continue;
    }

    const offset =
      positions.findIndex((x) => x === noteToNormalize.notePosInMeasure)! *
      (largestQuantitization / smallestQuantitization - 1);
    const newNotePos =
      noteToNormalize.notePosInMeasure + smallestQuantitization - offset;

    updatedNotes.push({
      ...noteToNormalize,
      notePosInMeasure: newNotePos,
    });
  }

  for (const n of updatedNotes) {
    const idx = notes.findIndex((x) => x.id === n.id)!;
    notes[idx] = n;
  }

  // // 3. smallest quantitization / (n2.pos - n1.pos) to get difference
  let diff: number | undefined;

  for (let i = notes.length; i > 0; i--) {
    const n2 = notes[i - 1];
    const n1 = notes[i - 2];

    if (!n1) {
      return smallestQuantitization;
    }

    if (!diff) {
      diff = n2.notePosInMeasure - n1.notePosInMeasure;
    } else {
      const nextDiff = n2.notePosInMeasure - n1.notePosInMeasure;

      if (nextDiff !== diff) {
        return undefined;
      }
    }
  }

  return smallestQuantitization;
}
