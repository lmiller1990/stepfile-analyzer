<script lang="ts" setup>
import {
  PatternBagData,
  patternCategories,
  PatternCategory,
  patterns,
} from "../patterns";
import { useControlsStore } from "../store/controls";
import { quantizations } from "../uiConstants";
import SelectChart from "./SelectChart.vue";

const controlsStore = useControlsStore();

interface ByCategory {
  category: string;
  data: PatternBagData[];
}

const formatLabel = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}s`;

const patternsByCategory = patternCategories.map<ByCategory>((category) => {
  const byCat: ByCategory = {
    category: formatLabel(category),
    data: Object.values(patterns).filter((x) => x.category === category),
  };
  return byCat;
});
</script>

<template>
  <div class="h-full w-full">
    <SelectChart />
    <div>
      <div>
        <h1>Quantization</h1>
        <div id="controls-quantization">
          <!-- remove temporary 0th quantization -->
          <div v-for="q of quantizations.slice(1)" :key="q.id">
            <input
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
          <h2 class="text-xl my-2">{{ patternData.category }}</h2>

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

h1 {
  @apply text-2xl text-center my-2;
}
</style>
