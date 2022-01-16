<script lang="ts" setup>
import { useChartStore } from "../store/chart";
import { useControlsStore } from "../store/controls";
import { quantizations } from "../uiConstants";
import { patternsByCategory } from "../utils";
import SelectChart from "./SelectChart.vue";
import UploadChart from "./UploadChart.vue";
import UseExampleChart from "./UseExampleChart.vue";

const controlsStore = useControlsStore();
const chartStore = useChartStore();
</script>

<template>
  <div class="h-full w-full">
    <h1>{{ chartStore.song?.title }}</h1>
    <SelectChart />
    <UploadChart />
    <UseExampleChart />
    <div>
      <div>
        <h1>Quantization</h1>
        <div id="controls-quantization">
          <!-- remove temporary 0th quantization -->
          <div v-for="q of quantizations.slice(1)" :key="q.id">
            <input
              :data-cy="`quantization-${q.id}`"
              type="checkbox"
              :id="q.id"
              :value="q.id"
              :checked="controlsStore.selectedQuantizations.has(q)"
              @input="controlsStore.toggleQuantization(q)"
            />
            <label :for="q.id">{{ q.name }}</label>
          </div>
        </div>
      </div>

      <div>
        <h1>Patterns</h1>
        <div
          v-for="patternData of patternsByCategory"
          :key="patternData.category"
        >
          <h2>{{ patternData.category }}</h2>

          <div class="pattern-container">
            <div v-for="pattern of patternData.data" :key="pattern.id">
              <input
                :id="pattern.id"
                :value="pattern.id"
                type="checkbox"
                :checked="controlsStore.selectedPatterns.has(pattern.id)"
                @input="controlsStore.togglePattern(pattern.id)"
              />
              <label :for="pattern.id">{{ pattern.label }}</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#controls-quantization {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.pattern-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}
</style>
