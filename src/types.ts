import { Quantitization } from "./noteData";

export interface NoteLine {
  id: string;
  notePosInMeasure: number;
  left: boolean;
  raw: string;
  up: boolean;
  down: boolean;
  right: boolean;
  measure: number;
  measureQuantitization: Quantitization;
  noteQuantitization: Quantitization; // 4th, 8th etc.
}

export interface Measure<T = NoteLine> {
  number: number
  quantitization: number
  notes: T[]
}

export type Direction = "left" | "right" | "up" | "down";

export interface NoteLineWithPatternData extends NoteLine {
  // pattern which this note line is part of
  // for example Set ("ulr-candle", "ll-tap")
  patterns: Set<string>
}

export interface ContainedNote {
  notePosInMeasure: number;
  measureQuantitization: number;
  noteQuantitization: number;
  measureNumber: number;
}

export interface PatternData {
  noteCheckIndex: number;
  patternQuantitization: number;
  completed: boolean;

  // eg in this measure
  // 1000
  // 1000
  // 1000
  // 0000
  // a three note jackhammer of 4ths would contain note 1, 2, 3.
  // useful for building a nice UI to visualize the patterns.
  containedNotePositionsInMeasure: ContainedNote[];
}

export interface PatternAnalysis {
  key: string; // urd-candle, etc
  count: number;
  collection: Map<string, PatternData>;
}
