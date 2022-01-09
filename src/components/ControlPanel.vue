<script lang="ts" setup>
import { patterns } from "../patterns";
import { useControlsStore } from "../store/controls";
import { quantizations } from "../uiConstants";
import SelectChart from './SelectChart.vue'

const controlsStore = useControlsStore();
</script>

<template>
  <div class="h-full w-full">
    <SelectChart />
    <div class="flex">
      <div>
        <h1>Patterns</h1>
        <div v-for="pattern of Object.values(patterns)" :key="pattern.id">
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

    <div>
      <h1>Quantization</h1>
      <div v-for="q of quantizations" :key="q.id">
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
</template>
