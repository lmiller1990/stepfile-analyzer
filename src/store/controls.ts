import { defineStore } from "pinia";
import { Quantization } from "../noteData";
import { Measure, NoteLineWithPatternData, PatternPositionData } from "../types";
import { quantizations, UIQuantization } from "../uiConstants";

interface ControlsStoreState {
  selectedPatterns: Set<string>;
  selectedQuantizations: Set<UIQuantization>;
  linesToHighlight: number[]
}

function linesToHighlight(
  measures: Measure<NoteLineWithPatternData>[],
  patterns: Set<string>,
  quantizations: Quantization[]
): number[] {

  type HighlightData = { startId?: number; finishId?: number }

  const highlightMap = new Map<string, HighlightData>();

  function updateFound(found: HighlightData, line: NoteLineWithPatternData, data: PatternPositionData) {
    if (data.isFirstNoteOfPattern) {
      found.startId = parseInt(line.id, 10);
    }
    if (data.isLastNoteOfPattern) {
      found.finishId = parseInt(line.id, 10);
    }
    return found
  }

  for (const m of measures) {
    for (const line of m.notes) {
      for (const [pattern, patternData] of Array.from(line.patterns)) {
        const hasPattern = patterns.has(pattern);
        const hasQuan = quantizations.includes(patternData.patternQuantization);
        if (hasPattern && hasQuan) {
          const id = patternData.patternRandomId
          let found = highlightMap.get(id)
          const updated = updateFound(found || {}, line, patternData)
          highlightMap.set(id, updated)
        }
      }
    }
  }

  console.log(highlightMap)

  const linesToHighlight: number[] = []

  for (const group of highlightMap.values()) {
    if (!group.startId || !group.finishId) {
      throw Error(`Expected ${JSON.stringify(group)} to have startId and endId!`)
    }

    for (let i = group.startId; i <= group.finishId; i++) {
      linesToHighlight.push(i)
    }
  }

  // for (const line of toHighlight) {
  //   for (let i = line.lineId; i < line.
  // }

  return linesToHighlight;
}

const cachedToHighlight = new Map<Measure<NoteLineWithPatternData>[], number[]>()

export const useControlsStore = defineStore("controls", {
  state: (): ControlsStoreState => ({
    selectedPatterns: new Set(["urd-candle", "ldur-sweep"]),
    selectedQuantizations: new Set([quantizations[1]]),
    linesToHighlight: []
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
    
    setToHighlight (toHighlight: number[]) {
      this.linesToHighlight = toHighlight
    }
  },

  getters: {
    toHighlight(state) {
      return (measures: Measure<NoteLineWithPatternData>[]): number[] => {

        // const cached = cachedToHighlight.get(measures)
        // if (cached) {
        //   console.log('using cache')
        //   return cached
        // }

          // console.log('computing')
        const toHighlight = linesToHighlight(
          measures,
          state.selectedPatterns,
          this.selectedQuantizationNumbers
        );
        // cachedToHighlight.set(measures, toHighlight)

        return toHighlight
      }
    },

    selectedQuantizationNumbers(state) {
      return [...state.selectedQuantizations.values()].map(
        (x) => x.quantization
      );
    },
  },
});
