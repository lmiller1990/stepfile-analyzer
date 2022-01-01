export const up = "0010";
export const down = "0100";
export const left = "1000";
export const right = "0001";

export type Note = typeof up | typeof down | typeof right | typeof left;

export type PatternBag = Record<string, readonly Note[]>;

export const patterns: PatternBag = {
  "urd-candle": [up, right, down],
  "ll-double-tap": [left, left],
  "lll-triple-tap": [left, left, left],
  "llll-quad-tap": [left, left, left, left],
} as const;