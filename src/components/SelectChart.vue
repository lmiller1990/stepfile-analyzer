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
  <div class="flex items-center justify-around">
    <h3>Select Chart:</h3>
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
  </div>
</template>

<style scoped></style>
