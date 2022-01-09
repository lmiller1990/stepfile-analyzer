<script setup lang="ts">
import {
  addPatternDataToMeasures,
  analyzePatterns,
  createAnalysisResults,
  parse,
} from "../analysis";
import { patterns } from "../patterns";
import ControlPanel from "./ControlPanel.vue";
import { measureHeight } from "../uiConstants";
import MeasureC from "./Measure.vue";
import { useChartStore } from "../store/chart";
import StatsPanel from "./StatsPanel.vue";
import { computed } from "vue";

const chartStore = useChartStore();

const output = computed(() => {
  const data = parse(chartStore.selectedChart.data);
  const analysis = analyzePatterns(
    createAnalysisResults(patterns),
    data.lines,
    data.measures,
    patterns
  );

  const measures = addPatternDataToMeasures(data.measures, analysis);

  return {
    analysis,
    measures,
  };
});
</script>

<template>
  <div class="flex justify-center">
    <div id="main-container">
      <div id="stats-container" class="border border-left border-black p-4">
        <StatsPanel :analysis="output.analysis" />
      </div>

      <div id="chart-container" class="flex justify-center">
        <div id="measure-container">
          <MeasureC
            v-for="measure of output.measures"
            :measure="measure"
            :key="measure.number"
          />
        </div>
      </div>

      <div id="controls-container" class="border border-right border-black p-4">
        <ControlPanel />
      </div>
    </div>
  </div>
</template>

<style scoped>
.note {
  position: absolute;
}

* {
  box-sizing: content-box;
}

#main-container {
  /* max-width: 800px; */
  gap: 5px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr;
  grid-template-rows: 1fr;
  /* justify-items: center; */
  height: 100vh;
}

#chart-container {
  overflow: scroll;
}

#bottom-half {
  grid-column-start: 1;
  grid-column-end: 3;
}

#measure-container {
  height: 100%;
  width: 200px;
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: v-bind("measureHeight.px");
}
</style>
