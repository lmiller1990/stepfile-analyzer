import { QuantizationError } from "./errors";
import {
  noteData,
  Quantization,
  quantization,
  highestCommonDenominator,
} from "./noteData";
import type { PatternBag } from "./patterns";
import type {
  ContainedNote,
  Measure,
  NoteLine,
  NoteLineWithPatternData,
  PatternAnalysis,
  PatternData,
} from "./types";

function getQuantization(data: string[]): Quantization {
  let count: number = 0;
  for (const line of data) {
    if (line.startsWith(",")) {
      if (!quantization.includes(count as Quantization)) {
        throw new QuantizationError(count, data);
      }
      return count as Quantization;
    }
    count++;
  }

  throw new QuantizationError(count, data);
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
  let measureQuantization: Quantization | undefined = undefined;
  let newMeasure = true;
  let notePosInMeasure = 1;
  let id = 1;

  let currentMeasure: Measure = {
    number: measure,
    notes: [],
    quantization: 0,
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

      measureQuantization = getQuantization(thisMeasure);

      newMeasure = false;
      currentMeasure = {
        quantization: measureQuantization,
        number: measure,
        notes: [],
      };
    }

    if (!measureQuantization) {
      throw Error(`Meaure quantization cannot be null!`);
    }

    const q = noteData.get(measureQuantization)![notePosInMeasure - 1];

    if (!q) {
      throw new QuantizationError(notePosInMeasure - 1, currentMeasure);
    }

    const line: NoteLine = {
      id: id.toString(),
      notePosInMeasure,
      raw: datum,
      left: datum[0] === "1",
      down: datum[1] === "1",
      up: datum[2] === "1",
      right: datum[3] === "1",
      noteQuantization: q,
      measureQuantization: measureQuantization,
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
        if (overlap(pattern.notes[found.noteCheckIndex], note.raw)) {
          const updated: PatternData = {
            ...found,
            noteCheckIndex: found.noteCheckIndex + 1,
            containedNotePositionsInMeasure:
              found.containedNotePositionsInMeasure.concat({
                notePosInMeasure: note.notePosInMeasure,
                measureQuantization: note.measureQuantization,
                noteQuantization: note.noteQuantization,
                measureNumber: note.measure,
              }),
          };

          values[key].collection.set(k, updated);

          if (updated.noteCheckIndex === pattern.notes.length) {
            // end of pattern, set completed, increase count
            const data = values[key].collection.get(k)!;

            values[key].collection.set(k, {
              ...data,
              patternQuantization: getPatternQuantization(data, measures),
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
      const firstNoteOfPattern = pattern.notes[0];

      // check for start of pattern
      if (overlap(firstNoteOfPattern, note.raw)) {
        values[key].collection.set(note.id, {
          noteCheckIndex: 1,
          completed: false,
          patternQuantization: 0,
          containedNotePositionsInMeasure: [
            {
              notePosInMeasure: note.notePosInMeasure,
              measureQuantization: note.measureQuantization,
              noteQuantization: note.noteQuantization,
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
      if (found.noteCheckIndex !== pattern.notes.length) {
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
          patterns: new Map<string, Quantization>(),
        })),
      };
    }
  );

  for (const [pattern, analysis] of Object.entries(data)) {
    for (const [_, val] of analysis.collection) {
      for (const note of val.containedNotePositionsInMeasure) {
        measuresWithMetadata[note.measureNumber - 1].notes[
          note.notePosInMeasure - 1
        ].patterns.set(pattern, val.patternQuantization);
      }
    }
  }

  return measuresWithMetadata;
}

function sequential(notes: ContainedNote[]) {
  let diff: number | undefined = undefined

  for (let i = 0; i < notes.length - 1; i++) {
    if (!diff) {
      diff = notes[i + 1].notePosInMeasure - notes[i].notePosInMeasure;
    } else {
      const newDiff = notes[i + 1].notePosInMeasure - notes[i].notePosInMeasure;
      if (diff !== newDiff) {
        return false
      }
      diff = newDiff
    }
  }

  return true;
}

function allSameQuantization(notes: ContainedNote[]) {
  return notes.every((x) => x.noteQuantization === notes[0].noteQuantization);
}

class MeasureError extends Error {
  constructor() {
    super();
    this.name = "MeasureError";
  }
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
    // "Patterns spanning more than 2 measures are currently not supported!"
    return [];
  }

  return Array.from(m);
}

function getHighestQuantization(notes: ContainedNote[]): Quantization {
  return Math.max(...notes.map((x) => x.noteQuantization)) as Quantization;
}

function largestQuantizationInMeasure(measure: number, notes: ContainedNote[]) {
  return notes.reduce((acc, curr) => {
    if (curr.measureNumber === measure && curr.noteQuantization > acc) {
      return curr.noteQuantization;
    }
    return acc;
  }, 0);
}

export function createVirtualizedMeasure(
  measureNums: [number, number],
  containedNotePositionsInMeasure: ContainedNote[]
): ContainedNote[] {
  const [m1, m2] = measureNums.sort();
  const m1Notes = containedNotePositionsInMeasure.filter(
    (x) => x.measureNumber === m1
  );

  const m2Notes = containedNotePositionsInMeasure.filter(
    (x) => x.measureNumber === m2
  );

  const lastNoteOfFirstMeasure = m1Notes.reduce((acc, curr) => {
    return curr.notePosInMeasure > acc.notePosInMeasure ? curr : acc;
  }, m1Notes[0]);

  // Merge into a single virtual measure.
  // This means notes from m2 have their position in the measure increased.
  // If the measures have different quantization, it's a bit more complex, since
  // we need to remove notes from the largest measure and adjust the note positions
  // accordingly.

  // case: same quantization
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
  const m1Quan = m1Notes[0].measureQuantization;
  const m2Quan = m2Notes[0].measureQuantization;

  if (m1Quan === m2Quan) {
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

  // Case: m1 quantization (8) less than m2 quantization (16)
  // We need to normalize the quantization to q where q is
  // the highest quantization in the pattern (in this case it would
  // an 8th).
  // This means in the second measure we remove all the non 4th and 8th notes,
  // and adjust the note position.
  // q=8 -> q=16 would be like this... we remove every 2nd note.

  // 0100 "4th note" (pos: 1 -> pos: 1)
  // 0000 "16th note" <- remove
  // 1000 "8th note" (pos: 3 -> pos: 2)
  // 0000 "16th note" <- remove
  // 0000 "4th note" <- pos: 5 -> pos: 3
  // 0000 "16th note" <- remove
  // 0000 "8th note" pos: 7 -> pos: 4

  // q=4 -> q=16 would be this... removing ever 2nd, 3rd and 4th note.
  // 0100 "4th note" pos: 1 -> pos: 1
  // 0000 "16th note" <- remove
  // 1000 "8th note" <- remove
  // 0000 "16th note" <- remove
  // 0000 "4th note" <- pos: 5 -> pos: 2

  // figuring out how much to change the note position is kind of tricky.
  // for q=16 -> q=8, every second note is removed, and every subsequent note increases
  // it's position by the length of the new, normalized array + 1.

  if (m1Quan < m2Quan) {
    const d = highestCommonDenominator(m2Quan, m1Quan);
    const skip = m2Quan / d;
    const transformMap = new Map<number, number>();
    let j = 0;
    for (let i = 0; i < m2Quan; i++) {
      // this note is valid
      if (i % skip === 0) {
        transformMap.set(i + 1, j + 1);
        j++;
      }
    }

    return containedNotePositionsInMeasure.map((x) => {
      if (x.measureNumber === m1) {
        return x;
      }

      return {
        ...x,
        notePosInMeasure: transformMap.get(x.notePosInMeasure)! + m1Quan,
      };
    });
  } else {
    const d = highestCommonDenominator(m2Quan, m1Quan);
    const skip = m1Quan / d;

    const transformMap = new Map<number, number>();
    let j = 0;
    for (let i = 0; i < m2Quan; i++) {
      // this note is valid
      if (i % skip === 0) {
        transformMap.set(i + 1, j + 1);
        j++;
      }
    }

    return containedNotePositionsInMeasure.map((x) => {
      if (x.measureNumber === m1) {
        return {
          ...x,
          notePosInMeasure: transformMap.get(x.notePosInMeasure)!,
        };
      }

      return {
        ...x,
        notePosInMeasure: x.notePosInMeasure + m1Quan,
      };
    });
  }
}

function allDivisibleBy(notes: ContainedNote[], highestQuantization: number) {
  return notes.every((x) => highestQuantization % x.noteQuantization === 0);
}

export function getPatternQuantization(
  data: PatternData,
  measures: Measure[]
): Quantization {
  // case 1: all notes have the same quantization and are sequential
  // 0001
  // 0010
  // 0100

  if (
    allSameQuantization(data.containedNotePositionsInMeasure) &&
    sequential(data.containedNotePositionsInMeasure)
  ) {
    return data.containedNotePositionsInMeasure[0].noteQuantization;
  }

  // case: different quantization in a single measure, by all corectly divisible
  // eg
  // 0001 -> 4th
  // 0010 -> 8th
  // 0100 -> 4th
  // 1000 -> 8th
  // 0000
  // 0000
  // 0000
  // 0000

  const highestQuantization = getHighestQuantization(
    data.containedNotePositionsInMeasure
  );
  if (
    allDivisibleBy(data.containedNotePositionsInMeasure, highestQuantization) &&
    sequential(data.containedNotePositionsInMeasure)
  ) {
    return highestQuantization;
  }

  // case 2: across measures with same quantization
  // 0000
  // 0001
  // 0010
  // ,
  // 0100
  // 0000
  // 0000
  // 0000

  const measureNums = getMeasureNumbers(data.containedNotePositionsInMeasure);

  if (measureNums.length === 0) {
    return 0;
  }

  if (
    measureNums.length === 2 &&
    allSameQuantization(data.containedNotePositionsInMeasure)
  ) {
    const normalizedContainedNotes = createVirtualizedMeasure(
      measureNums as [number, number],
      data.containedNotePositionsInMeasure
    );

    if (sequential(normalizedContainedNotes)) {
      return data.containedNotePositionsInMeasure[0].noteQuantization;
    }
  }

  // case 3: across measures with different quantization
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

  if (
    measureNums.length === 2 &&
    !allSameQuantization(data.containedNotePositionsInMeasure)
  ) {
    const highestQuantization = getHighestQuantization(
      data.containedNotePositionsInMeasure
    );

    const [m1, m2] = measureNums.sort();
    const m1q = largestQuantizationInMeasure(
      m1,
      data.containedNotePositionsInMeasure
    );
    const m2q = largestQuantizationInMeasure(
      m2,
      data.containedNotePositionsInMeasure
    );

    const notes = data.containedNotePositionsInMeasure.filter(
      (x) => x.measureNumber === (m1q < m2q ? m1 : m2)
    );

    if (allDivisibleBy(notes, highestQuantization)) {
      const normalized = createVirtualizedMeasure(
        [m1, m2],
        data.containedNotePositionsInMeasure
      );

      // and sequential?
      if (sequential(normalized)) {
        return highestQuantization;
      }
    }
  }

  return 0;
}
