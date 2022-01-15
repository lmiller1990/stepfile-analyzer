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
import { computed, watchEffect } from "vue";
import { useError } from "../composables/useError";
import Error from "./Error.vue";
import { linesToHighlight, useControlsStore } from "../store/controls";

const chartStore = useChartStore();
const controlsStore = useControlsStore();
const { error, setError } = useError();

const output = computed(() => {
  if (!chartStore.selectedChart) {
    return;
  }

  try {
    const data = parse(chartStore.selectedChart.raw);
    const analysis = analyzePatterns(
      createAnalysisResults(patterns),
      data.lines,
      data.measures,
      patterns
    );

    const measures = addPatternDataToMeasures(data.measures, analysis);

    setError(undefined);

    return {
      analysis,
      measures,
    };
  } catch (e) {
    const err = e as Error;
    if (err.name === "SSCCompilerError") {
      setError(err.message);
    } else {
      setError(`Unexpected error: ${err.message}`);
    }
  }
});

watchEffect(() => {
  if (!output.value?.measures) {
    return;
  }

  const toHighlight = linesToHighlight(
    output.value.measures,
    controlsStore.selectedPatterns,
    controlsStore.selectedQuantizationNumbers
  );

  controlsStore.setToHighlight(toHighlight);
});
</script>

<template>
  <div class="flex justify-center">
    <div id="main-container">
      <div
        id="stats-container"
        class="border border-left border-black p-4 is-container"
      >
        <StatsPanel v-if="output" :analysis="output.analysis" />
      </div>

      <div id="chart-container" class="flex justify-center is-container">
        <div id="measure-container" v-if="output">
          <MeasureC
            v-for="measure of output.measures"
            :measure="measure"
            :key="measure.number"
          />
        </div>
      </div>

      <div
        id="controls-container"
        class="border border-right border-black p-4 is-container"
      >
        <ControlPanel />
      </div>
    </div>
  </div>
  <div class="fixed bottom-2 right-4" v-if="error">
    <Error />
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
  box-sizing: border-box;
  padding: 10px;
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

.is-container {
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
