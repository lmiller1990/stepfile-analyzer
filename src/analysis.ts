import type { PatternBag } from "./patterns";
import type {
  ContainedNote,
  Measure,
  NoteLine,
  NoteLineWithPatternData,
  PatternAnalysis,
  PatternData,
} from "./types";

function getQuantitization(data: string[]) {
  let count = 0;
  for (const line of data) {
    if (line.startsWith(",")) {
      return count;
    }
    count++;
  }
  return count;
}

export function parse(data: string): {
  lines: NoteLine[];
  measures: Measure[];
} {
  const notes: NoteLine[] = [];
  const lines = data.split("\n");
  const measures: Measure[] = [];

  let measure = 1;
  let measureQuantitization: number = 0;
  let newMeasure = true;
  let notePosInMeasure = 1;
  let id = 1;

  let currentMeasure: Measure = {
    number: measure,
    notes: [],
    quantitization: 0,
  };

  for (const d in lines) {
    const datum = lines[d].trim();

    if (datum.startsWith(",")) {
      measures.push(currentMeasure);
      measure++;
      notePosInMeasure = 1;
      newMeasure = true;
      continue;
    }

    if (newMeasure) {
      measureQuantitization = getQuantitization(lines.slice(parseInt(d, 10)));
      newMeasure = false;
      currentMeasure = {
        quantitization: measureQuantitization,
        number: measure,
        notes: [],
      };
    }

    const line: NoteLine = {
      id: id.toString(),
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
    currentMeasure.notes.push(line);
    id++;
    notePosInMeasure++;
  }

  return { lines: notes, measures };
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
      });
    }
  }

  return values;
}

export function addPatternDataToMeasures(
  measures: Measure[],
  data: Record<string, PatternAnalysis>
): Measure<NoteLineWithPatternData>[] {
  const measuresWithMetadata: Measure<NoteLineWithPatternData>[] = measures.map(
    (x) => {
      return {
        ...x,
        notes: x.notes.map<NoteLineWithPatternData>((y) => ({
          ...y,
          patterns: new Set<string>(),
        })),
      };
    }
  );

  for (const [pattern, analysis] of Object.entries(data)) {
    for (const [_, val] of analysis.collection) {
      for (const note of val.containedNotePositionsInMeasure) {
        measuresWithMetadata[note.measureNumber - 1].notes[
          note.notePosInMeasure - 1
        ].patterns.add(pattern);
      }
    }
  }

  return measuresWithMetadata;
}
