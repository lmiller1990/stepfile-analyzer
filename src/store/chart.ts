import { defineStore } from "pinia";
import { charts } from "../chart";

interface ChartStoreState {
  selectedChartId: string;
}

export const useChartStore = defineStore("chart", {
  state: (): ChartStoreState => ({
    selectedChartId: "candles",
  }),

  actions: {
    setSelectedChartId(id: string) {
      this.selectedChartId = id;
    },
  },

  getters: {
    selectedChart: (state) => {
      const c = charts.get(state.selectedChartId);
      if (!c) {
        throw Error(`No chart with id ${state.selectedChartId} found.`);
      }
      return c;
    },
  },
});
