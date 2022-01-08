import { QuantitizationError } from "./errors";
import { noteData, Quantitization, quantitization } from "./noteData";
import type { PatternBag } from "./patterns";
import type {
  ContainedNote,
  Measure,
  NoteLine,
  NoteLineWithPatternData,
  PatternAnalysis,
  PatternData,
} from "./types";

function getQuantitization(data: string[]): Quantitization {
  let count: number = 0;
  for (const line of data) {
    if (line.startsWith(",")) {
      if (!quantitization.includes(count as Quantitization)) {
        throw new QuantitizationError(count, data);
      }
      return count as Quantitization;
    }
    count++;
  }

  throw new QuantitizationError(count, data);
}

export function parse(data: string): {
  lines: NoteLine[];
  measures: Measure[];
} {
  const notes: NoteLine[] = [];
  const lines = data
    .split("\n")
    .filter((x) => x.length > 0)
    .map((x) => x.trim());
  const measures: Measure[] = [];

  let measure = 1;
  let measureQuantitization: Quantitization | undefined = undefined;
  let newMeasure = true;
  let notePosInMeasure = 1;
  let id = 1;

  let currentMeasure: Measure = {
    number: measure,
    notes: [],
    quantitization: 0,
  };

  for (let i = 0; i < lines.length; i++) {
    const datum = lines[i].trim();

    if (datum.startsWith(",")) {
      measures.push(currentMeasure);
      measure++;
      notePosInMeasure = 1;
      newMeasure = true;
      continue;
    }

    if (newMeasure) {
      const thisMeasure = lines.slice(i).filter((x) => x.length > 0);
      measureQuantitization = getQuantitization(thisMeasure);

      newMeasure = false;
      currentMeasure = {
        quantitization: measureQuantitization,
        number: measure,
        notes: [],
      };
    }

    if (!measureQuantitization) {
      throw Error(`Meaure quantitization cannot be null!`);
    }

    const q = noteData.get(measureQuantitization)![notePosInMeasure - 1];

    if (!q) {
      throw new QuantitizationError(notePosInMeasure - 1, currentMeasure);
    }

    const line: NoteLine = {
      id: id.toString(),
      notePosInMeasure,
      raw: datum,
      left: datum[0] === "1",
      down: datum[1] === "1",
      up: datum[2] === "1",
      right: datum[3] === "1",
      noteQuantitization: q,
      measureQuantitization: measureQuantitization,
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
  measures: Measure[],
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
                measureQuantitization: note.measureQuantitization,
                noteQuantitization: note.noteQuantitization,
                measureNumber: note.measure,
              }),
          };

          values[key].collection.set(k, updated);

          if (updated.noteCheckIndex === pattern.length) {
            // end of pattern, set completed, increase count
            const data = values[key].collection.get(k)!;
            values[key].collection.set(k, {
              ...data,
              patternQuantitization: getPatternQuantitization(data, measures),
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
          patternQuantitization: 0,
          containedNotePositionsInMeasure: [
            {
              notePosInMeasure: note.notePosInMeasure,
              measureQuantitization: note.measureQuantitization,
              noteQuantitization: note.noteQuantitization,
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
          patterns: new Map<string, Quantitization>(),
        })),
      };
    }
  );

  for (const [pattern, analysis] of Object.entries(data)) {
    for (const [_, val] of analysis.collection) {
      for (const note of val.containedNotePositionsInMeasure) {
        measuresWithMetadata[note.measureNumber - 1].notes[
          note.notePosInMeasure - 1
        ].patterns.set(pattern, val.patternQuantitization);
      }
    }
  }

  return measuresWithMetadata;
}

function sequential(notes: ContainedNote[]) {
  for (let i = 0; i < notes.length - 1; i++) {
    const diff = notes[i + 1].notePosInMeasure - notes[i].notePosInMeasure;
    if (diff !== 1) {
      return false;
    }
  }

  return true;
}

function allSameQuantitization(notes: ContainedNote[]) {
  return notes.every(
    (x) => x.noteQuantitization === notes[0].noteQuantitization
  );
}

/**
 * Get a list of all measure numbers
 * represented by a list of notes
 */
function getMeasureNumbers(notes: ContainedNote[]) {
  const m = notes.reduce((acc, curr) => {
    if (!acc.has(curr.measureNumber)) {
      acc.add(curr.measureNumber);
    }
    return acc;
  }, new Set<number>());

  if (m.size > 2) {
    throw Error(
      "Patterns spanning more than 2 measures are currently not supported!"
    );
  }

  return Array.from(m);
}

function getHighestQuantitization(notes: ContainedNote[]): Quantitization {
  return Math.max(...notes.map((x) => x.noteQuantitization)) as Quantitization;
}

function createVirtualizedMeasure(
  measureNums: [number, number],
  containedNotePositionsInMeasure: ContainedNote[]
) {
  const [m1, m2] = measureNums.sort();
  const m1Notes = containedNotePositionsInMeasure.filter(
    (x) => x.measureNumber === m1
  );

  const lastNoteOfFirstMeasure = m1Notes.reduce((acc, curr) => {
    return curr.notePosInMeasure > acc.notePosInMeasure ? curr : acc;
  }, m1Notes[0]);

  // merge into a single virtual measure
  // this means notes from m2 have their position in the measure increased
  // by the last note in m1
  // eg
  // 0000
  // 0000
  // 1000 pos: 3
  // 0100 pos: 4
  // ,
  // 0010 pos: 1 (should become pos: 5
  // 0000
  // 0000
  // 0000
  // then we just see if they are sequential like in case 1
  return containedNotePositionsInMeasure.map((x) => {
    if (x.measureNumber === m1) {
      return x;
    }
    return {
      ...x,
      notePosInMeasure:
        x.notePosInMeasure + lastNoteOfFirstMeasure.notePosInMeasure,
    };
  });
}

function allDivisibleBy(notes: ContainedNote[], highestQuantitization: number) {
  return notes.every((x) => highestQuantitization % x.noteQuantitization === 0);
}

export function getPatternQuantitization(
  data: PatternData,
  measures: Measure[]
): Quantitization {
  // case 1: all notes have the same quantitization and are sequential
  // 0001
  // 0010
  // 0100

  if (
    allSameQuantitization(data.containedNotePositionsInMeasure) &&
    sequential(data.containedNotePositionsInMeasure)
  ) {
    return data.containedNotePositionsInMeasure[0].noteQuantitization;
  }

  // case: different quantitization in a single measure, by all corectly divisible
  // eg
  // 0001 -> 4th
  // 0010 -> 8th
  // 0100 -> 4th
  // 1000 -> 8th
  // 0000
  // 0000
  // 0000
  // 0000

  const highestQuantitization = getHighestQuantitization(
    data.containedNotePositionsInMeasure
  );
  if (
    allDivisibleBy(
      data.containedNotePositionsInMeasure,
      highestQuantitization
    ) &&
    sequential(data.containedNotePositionsInMeasure)
  ) {
    return highestQuantitization
  }

  // case 2: across measures with same quantitization
  // 0000
  // 0001
  // 0010
  // ,
  // 0100
  // 0000
  // 0000
  // 0000

  const measureNums = getMeasureNumbers(data.containedNotePositionsInMeasure);

  if (
    measureNums.length === 2 &&
    allSameQuantitization(data.containedNotePositionsInMeasure)
  ) {
    const normalizedContainedNotes = createVirtualizedMeasure(
      measureNums as [number, number],
      data.containedNotePositionsInMeasure
    );

    if (sequential(normalizedContainedNotes)) {
      return data.containedNotePositionsInMeasure[0].noteQuantitization;
    }
  }

  // case 3: across measures with different quantitization
  // in this example the first measure q=8, second q=16
  // an 8th note "sweep" continues from m1 to m2.
  //
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0001 "4th note"
  // 0010 "8th note"
  // ,
  // 0100 "4th note"
  // 0000 "16th note"
  // 1000 "8th note"
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0000
  // 0001
  // 0000

  // we need to normalize the quantitization to q where q is
  // the highest quantitization in the pattern (in this case it would
  // an 8th).
  // This means in the second measure we remove all the non 4th and 8th notes, eg:

  // 0100 "4th note"
  // 0000 "16th note" <- remove
  // 1000 "8th note"
  // 0000 "16th note" <- remove
  // 0000 "4th note"
  // 0000

  if (
    measureNums.length === 2 &&
    !allSameQuantitization(data.containedNotePositionsInMeasure)
  ) {
    const highestQuantitization = getHighestQuantitization(
      data.containedNotePositionsInMeasure
    );

    const [m1, m2] = measureNums.sort();
    const m1q = data.containedNotePositionsInMeasure.find(
      (x) => x.measureNumber === m1
    )!.noteQuantitization;
    const m2q = data.containedNotePositionsInMeasure.find(
      (x) => x.measureNumber === m2
    )!.noteQuantitization;

    // find m with lowest q
    // m1 is lower then m2
    // if (m1q < m2q) {
    const notes = data.containedNotePositionsInMeasure.filter(
      (x) => x.measureNumber === (m1q < m2q ? m1 : m2)
    );
    if (allDivisibleBy(notes, highestQuantitization)) {
      const normalized = createVirtualizedMeasure(
        [m1, m2],
        data.containedNotePositionsInMeasure
      );

      // and sequential?
      if (sequential(normalized)) {
        return highestQuantitization;
      }
    }
  }

  console.log("EEEE");

  return 0;
}
