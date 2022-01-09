<script lang="ts" setup>
import { Chart, charts } from "../chart";
import { useChartStore } from "../store/chart";

const chartStore = useChartStore();

function handleInput(event: Event) {
  const id = (event.target as HTMLSelectElement).value;
  chartStore.setSelectedChartId(id);
}
</script>

<template>
  {{ chartStore.selectedChart.id }}
  <select :value="chartStore.selectedChartId" @input="handleInput">
    <option
      v-for="chart of charts.values()"
      :id="chart.id"
      :value="chart.id"
      :key="chart.id"
    >
      {{ chart.name }}
    </option>
  </select>
</template>

<style scoped></style>
