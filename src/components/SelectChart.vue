<script lang="ts" setup>
import { computed } from "vue";
import { ChartDifficulty } from "../sscParser";
import { useChartStore } from "../store/chart";

const chartStore = useChartStore();

const charts = computed(() => {
  if (!chartStore.song?.charts) {
    return [];
  }

  return chartStore.song?.charts.reduce<
    Array<{ difficulty: ChartDifficulty; meter: string }>
  >((acc, curr) => {
    if (curr.steps !== "dance-single") {
      return acc;
    }
    return [
      ...acc,
      {
        difficulty: curr.difficulty,
        meter: curr.meter,
      },
    ];
  }, []);
});

function handleInput(event: Event) {
  const difficulty = (event.target as HTMLSelectElement)
    .value as ChartDifficulty;
  chartStore.setSelectedChartDifficulty(difficulty);
}
</script>

<template>
  <div class="flex items-center justify-around">
    <h3>Select Chart:</h3>
    <select
      data-cy="select-chart"
      :value="chartStore.selectedChartDifficulty"
      @input="handleInput"
    >
      <option
        v-for="chart of charts"
        :id="chart.difficulty"
        :value="chart.difficulty"
        :key="chart.difficulty"
      >
        {{ chart.difficulty }} ({{ chart.meter }})
      </option>
    </select>
  </div>
</template>

<style scoped></style>
