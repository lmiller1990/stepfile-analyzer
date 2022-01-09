import { defineStore } from "pinia";
import { quantizations } from "../uiConstants";

type UIQuantization = typeof quantizations[number];

interface ControlsStoreState {
  selectedPattern: string;
  selectedQuantization: UIQuantization;
}

export const useControlsStore = defineStore("controls", {
  state: (): ControlsStoreState => ({
    selectedPattern: "urd-candle",
    selectedQuantization: quantizations[0],
  }),
  actions: {
    setSetQuantization(q: UIQuantization) {
      this.selectedQuantization = q;
    },
  },
});
