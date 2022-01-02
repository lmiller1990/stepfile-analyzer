export interface NoteLine {
  id: string;
  notePosInMeasure: number;
  left: boolean;
  raw: string;
  up: boolean;
  down: boolean;
  right: boolean;
  measure: number;
  quantitization: number; // 4th, 8th etc.
}

export interface PatternData {
  noteCheckIndex: number;
  completed: boolean;

  // eg in this measure
  // 1000
  // 1000
  // 1000
  // 0000
  // a three note jackhammer of 4ths would contain note 1, 2, 3.
  // useful for building a nice UI to visualize the patterns.
  containedNotePositionsInMeasure: Array<{
    notePosInMeasure: number;
    measureQuantitization: number;
    measureNumber: number;
  }>;

  quantitization?: number;
}

export interface PatternAnalysis {
  key: string; // urd-candle, etc
  count: number;
  collection: Map<string, PatternData>;
}
