export const up = "0010";
export const down = "0100";
export const left = "1000";
export const right = "0001";

export type Note = typeof up | typeof down | typeof right | typeof left;

export type PatternBag = Record<string, readonly Note[]>;

type PatternCategory =
  | "candle"
  | "sweep"
  | "jack"
  | "staircase"
  | "crossover"
  | "trill";

interface Pattern {
  id: string;
  category: PatternCategory;
}

const allPatterns = [];

export const patterns: PatternBag = {
  "urd-candle": [up, right, down],
  "uld-candle": [up, left, down],
  "dlu-candle": [down, left, up],
  "dru-candle": [down, right, up],
  "ldurudl-sweep": [left, down, up, right, up, down, left],
  "ldur-sweep": [left, down, up, right],
  "rudl-sweep": [right, up, down, left],
  "ll-double-tap": [left, left],
  "lll-triple-tap": [left, left, left],
  "llll-quad-tap": [left, left, left, left],
  "lrlr-drill": [left, right, left, right],
} as const;
