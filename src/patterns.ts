export const up = "0010";
export const down = "0100";
export const left = "1000";
export const right = "0001";

export type Note = typeof up | typeof down | typeof right | typeof left;

export type PatternBag = Record<string, PatternBagData>;

export interface PatternBagData {
  id: string;
  notes: readonly Note[];
  label: string;
  category: PatternCategory;
}

export const patternCategories = [
  "candle",
  "sweep",
  "jack",
  "staircase",
  "crossover",
  "drill",
] as const;

export type PatternCategory = typeof patternCategories[number];

/**
 * generate all combinations of
 * LRLR DRDR etc.
 */
const drills: PatternBag = {};

const dirs = [
  { d: "l", n: left },
  { d: "r", n: right },
  { d: "u", n: up },
  { d: "d", n: down },
] as const;

for (const d1 of dirs) {
  for (const d2 of dirs) {
    if (d1.d === d2.d) {
      continue;
    }

    const key = `${d1.d}${d2.d}${d1.d}${d2.d}`;
    drills[`${key}-drill`] = {
      id: `${key}-drill`,
      label: `${key.toUpperCase()} Drill`,
      notes: [d1.n, d2.n, d1.n, d2.n],
      category: "drill",
    };
  }
}

export const patterns: PatternBag = {
  "urd-candle": {
    id: "urd-candle",
    label: "URD Candle",
    notes: [up, right, down],
    category: "candle",
  },
  "uld-candle": {
    id: "uld-candle",
    label: "ULD Candle",
    notes: [up, left, down],
    category: "candle",
  },
  "dlu-candle": {
    id: "dlu-candle",
    label: "DLU Candle",
    notes: [down, left, up],
    category: "candle",
  },
  "dru-candle": {
    id: "dru-candle",
    label: "DRU Candle",
    notes: [down, right, up],
    category: "candle",
  },

  "ldur-sweep": {
    id: "ldur-sweep",
    label: "LDUR Sweep",
    notes: [left, down, up, right],
    category: "sweep",
  },
  "ludr-sweep": {
    id: "ludr-sweep",
    label: "LUDR Sweep",
    notes: [left, up, down, right],
    category: "sweep",
  },
  "rudl-sweep": {
    id: "rudl-sweep",
    label: "RUDL Sweep",
    notes: [right, up, down, left],
    category: "sweep",
  },
  "rdul-sweep": {
    id: "rdul-sweep",
    label: "RDUL Sweep",
    notes: [right, down, up, left],
    category: "sweep",
  },

  "ll-double-tap": {
    id: "ll-double-tap",
    label: "LL Double Tap",
    notes: [left, left],
    category: "jack",
  },

  "lll-triple-tap": {
    id: "lll-triple-tap",
    label: "LLL Triple Tap",
    notes: [left, left, left],
    category: "jack",
  },

  "rr-double-tap": {
    id: "rr-double-tap",
    label: "RR Double Tap",
    notes: [right, right],
    category: "jack",
  },

  "rrr-double-tap": {
    id: "rrr-double-tap",
    label: "RRR Double Tap",
    notes: [right, right, right],
    category: "jack",
  },

  "uu-double-tap": {
    id: "uu-double-tap",
    label: "UU Double Tap",
    notes: [up, up],
    category: "jack",
  },

  "uuu-double-tap": {
    id: "uuu-double-tap",
    label: "UUU Double Tap",
    notes: [up, up, up],
    category: "jack",
  },

  "dd-double-tap": {
    id: "dd-double-tap",
    label: "DD Double Tap",
    notes: [down, down],
    category: "jack",
  },

  "ddd-double-tap": {
    id: "ddd-double-tap",
    label: "DDD Double Tap",
    notes: [down, down, down],
    category: "jack",
  },

  "lrlr-drill": {
    id: "lrlr-drill",
    label: "LRLR Drill",
    notes: [left, right, left, right],
    category: "jack",
  },

  ...drills,
} as const;
