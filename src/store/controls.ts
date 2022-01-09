import { defineStore } from "pinia";
import { quantizations, UIQuantization } from "../uiConstants";

interface ControlsStoreState {
  selectedPatterns: Set<string>;
  selectedQuantizations: Set<UIQuantization>;
}

export const useControlsStore = defineStore("controls", {
  state: (): ControlsStoreState => ({
    selectedPatterns: new Set(["urd-candle", "ldur-sweep"]),
    selectedQuantizations: new Set([quantizations[1]]),
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
  },

  getters: {
    selectedQuantizationNumbers(state) {
      return [...state.selectedQuantizations.values()].map(
        (x) => x.quantization
      );
    },
  },
});
