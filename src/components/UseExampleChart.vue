<script lang="ts" setup>
import { compileSSC } from "../sscParser";
import { useChartStore } from "../store/chart";
import { monolith, summer, bloodrush } from "../exampleCharts";

const chartStore = useChartStore();

async function handleExample(ex: typeof examples[number]) {
  const song = compileSSC(ex.chart);
  chartStore.setSong(song);
  chartStore.setSelectedChartDifficulty("Challenge");
}

const examples = [
  {
    name: "Summer",
    chart: summer,
  },
  {
    name: "Monolith",
    chart: monolith,
  },
  {
    name: "Bloodrush",
    chart: bloodrush,
  },
] as const;
</script>

<template>
  <div class="flex justify-around">
    <button
      v-for="ex of examples"
      :key="ex.name"
      class="border border-2 rounded-md p-1 px-2 mt-1"
      @click="handleExample(ex)"
    >
      {{ ex.name }}
    </button>
  </div>
</template>

<style scoped></style>
