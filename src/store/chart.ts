import { defineStore } from "pinia";
import { ChartDifficulty, Song } from "../sscParser";

interface ChartStoreState {
  selectedChartDifficulty?: ChartDifficulty;
  song?: Song;
}

export const useChartStore = defineStore("chart", {
  state: (): ChartStoreState => ({
    selectedChartDifficulty: undefined,
    song: undefined,
  }),

  actions: {
    setSelectedChartDifficulty (difficulty: ChartDifficulty) {
      this.selectedChartDifficulty = difficulty
    },

    setSong(song: Song) {
      this.song = song;
    },
  },

  getters: {
    selectedChart: (state) => {
      // const c = charts.get(state.selectedChartId);
      if (!state.song || !state.selectedChartDifficulty) {
        return
      }

      const c = state.song.charts?.find(x => x.difficulty === state.selectedChartDifficulty)

      if (!c) {
        throw Error(`No chart with id ${state.selectedChartDifficulty} found.`);
      }

      return c;
    },
  },
});
