import { add, over } from "cypress/types/lodash";
import { defineStore } from "pinia";
import { Quantization } from "../noteData";
import {
  Measure,
  NoteLineWithPatternData,
  PatternPositionData,
} from "../types";
import { quantizations, UIQuantization } from "../uiConstants";

interface ControlsStoreState {
  selectedPatterns: Set<string>;
  selectedQuantizations: Set<UIQuantization>;
  linesToHighlight: HighlightLines;
}

type HighlightLines = Map<
  number,
  {
    isLastLine: boolean;
  }
>;

function nearest(num: number, others: number[]) {
  return others.reduce<number>((acc, curr) => {
    if (num > curr) {
      return acc;
    }

    if (curr - num < acc - num) {
      return curr;
    }

    return acc;
  }, Number.POSITIVE_INFINITY);
}

export function linesToHighlight(
  measures: Measure<NoteLineWithPatternData>[],
  patterns: Set<string>,
  quantizations: Quantization[]
): HighlightLines {
  type HighlightData = { startId?: number; finishId?: number };

  const highlightMap = new Map<string, HighlightData>();

  function updateFound(
    found: HighlightData,
    line: NoteLineWithPatternData,
    data: PatternPositionData
  ) {
    if (data.isFirstNoteOfPattern) {
      found.startId = parseInt(line.id, 10);
    }
    if (data.isLastNoteOfPattern) {
      found.finishId = parseInt(line.id, 10);
    }
    return found;
  }

  for (const m of measures) {
    for (const line of m.notes) {
      for (const [pattern, patternData] of line.patterns) {
        const hasPattern = patterns.has(pattern);
        const hasQuan = quantizations.includes(patternData.patternQuantization);
        if (hasPattern && hasQuan) {
          const id = patternData.patternRandomId;
          let found = highlightMap.get(id);
          const updated = updateFound(found || {}, line, patternData);
          highlightMap.set(id, updated);
        }
      }
    }
  }

  const linesToHighlight: HighlightLines = new Map();

  let overlaps: number[] = [];

  for (const group of highlightMap.values()) {
    if (!group.startId || !group.finishId) {
      console.error(
        `Bug alert! Expected ${JSON.stringify(
          group
        )} to have startId and endId! Using a hack to attempt to correctly highlight measures.`
      );
      if (group.startId && !group.finishId) {
        overlaps.push(group.startId);
      }

      continue;
    }

    for (let i = group.startId; i <= group.finishId; i++) {
      linesToHighlight.set(i, { isLastLine: i === group.finishId });
    }
  }

  const keys = Array.from(linesToHighlight.keys());

  const additional = overlaps.map((x) => nearest(x, keys));
  additional.forEach((x) => {
    linesToHighlight.set(x, { isLastLine: false });
  });

  return linesToHighlight;
}

export const useControlsStore = defineStore("controls", {
  state: (): ControlsStoreState => ({
    selectedPatterns: new Set(["urd-candle", "ldur-sweep"]),
    selectedQuantizations: new Set([quantizations[1]]),
    linesToHighlight: new Map(),
  }),

  actions: {
    togglePattern(pattern: string) {
      if (this.selectedPatterns.has(pattern)) {
        this.selectedPatterns.delete(pattern);
      } else {
        this.selectedPatterns.add(pattern);
      }
    },

    toggleQuantization(q: UIQuantization) {
      if (this.selectedQuantizations.has(q)) {
        this.selectedQuantizations.delete(q);
      } else {
        this.selectedQuantizations.add(q);
      }
    },

    setToHighlight(toHighlight: HighlightLines) {
      this.linesToHighlight = toHighlight;
    },
  },

  getters: {
    selectedQuantizationNumbers(state) {
      return [...state.selectedQuantizations.values()].map(
        (x) => x.quantization
      );
    },
  },
});
