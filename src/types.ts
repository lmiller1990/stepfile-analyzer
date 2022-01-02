export interface NoteLine {
  id: string
  left: boolean;
  raw: string;
  up: boolean;
  down: boolean;
  right: boolean;
  measure: number;
  quantitization: number; // 4th, 8th etc.
}

export interface PatternAnalysis {
  key: string; // urd-candle, etc
  count: number;
  collection: Map<
    string,
    {
      noteCheckIndex: number;
    }
  >;
}
