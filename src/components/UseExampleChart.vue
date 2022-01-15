<script lang="ts" setup>
import { compileSSC } from "../sscParser";
import { useChartStore } from "../store/chart";
import { monolith } from "../exampleCharts"

const chartStore = useChartStore();

async function handleExample() {
  const song = compileSSC(monolith)
  chartStore.setSong(song)
  chartStore.setSelectedChartDifficulty("Challenge")
}
</script>

<template>
  <div class="flex">
    <button class="border border-2 rounded-md p-1 mt-1" @click="handleExample">Use demo (Monolith, ITG2)</button>
  </div>
</template>

<style scoped></style>
