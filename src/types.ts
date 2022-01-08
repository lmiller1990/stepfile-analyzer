import { Quantization } from "./noteData";

export interface NoteLine {
  id: string;
  notePosInMeasure: number;
  left: boolean;
  raw: string;
  up: boolean;
  down: boolean;
  right: boolean;
  measure: number;
  measureQuantization: Quantization;
  noteQuantization: Quantization; // 4th, 8th etc.
}

export interface Measure<T = NoteLine> {
  number: number
  quantization: number
  notes: T[]
}

export type Direction = "left" | "right" | "up" | "down";

export interface NoteLineWithPatternData extends NoteLine {
  // pattern which this note line is part of
  // and quantization ("ulr-candle", "ll-tap")
  // eg Map<[
  //   ulr-candle: 4
  // ]>
  patterns: Map<string, Quantization>;
}

export interface ContainedNote {
  notePosInMeasure: number;
  measureQuantization: Quantization;
  noteQuantization: Quantization;
  measureNumber: number;
}

export interface PatternData {
  noteCheckIndex: number;
  patternQuantization: Quantization;
  completed: boolean;

  // eg in this measure
  // 1000
  // 1000
  // 1000
  // 0000
  // a three note jackhammer of 4ths would contain note 1, 2, 3.
  // useful for building a nice UI to visualize the patterns.
  containedNotePositionsInMeasure: ContainedNote[]
}

export interface PatternAnalysis {
  key: string; // urd-candle, etc
  count: number;
  collection: Map<string, PatternData>;
}
