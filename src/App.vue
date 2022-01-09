<script setup lang="ts">
import {
  addPatternDataToMeasures,
  analyzePatterns,
  createAnalysisResults,
  parse,
} from "./analysis";
import { patterns } from "./patterns";
import { chart } from "./chart";
import ControlPanel from "./ControlPanel.vue";
import { measureHeight } from "./uiConstants";
import MeasureC from "./Measure.vue";

const data = parse(chart);
const analysis = analyzePatterns(
  createAnalysisResults(patterns),
  data.lines,
  data.measures,
  patterns
);

const measures = addPatternDataToMeasures(data.measures, analysis);
</script>

<template>
  <div id="main-container">
    <div id="stats-container" class="border border-2">
      Stats
    </div>

    <div id="chart-container" class="border border-2">

      <div id="measure-container">
        <MeasureC
          v-for="measure of measures"
          :measure="measure"
          :key="measure.number"
        />
      </div>
    </div>

    <div id="controls-container" class="border border-2">
      <ControlPanel />
    </div>

    <div id="bottom-half" class="border border-2">bottom</div>
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
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: 5fr 1fr;
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
