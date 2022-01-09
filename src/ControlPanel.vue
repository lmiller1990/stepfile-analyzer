<script lang="ts" setup>
import { patterns } from "./patterns";
import { useControlsStore } from "./store/controls";
import { quantizations } from "./uiConstants";

const controlsStore = useControlsStore();
</script>

<template>
  <div class="h-full w-full">
    <div class="flex">
      <div>
        <h1>Patterns</h1>
        <div v-for="name of Object.keys(patterns)" :key="name">
          <input
            :id="name"
            :value="name"
            type="radio"
            v-model="controlsStore.selectedPattern"
          />
          <label :for="name">{{ name }}</label>
        </div>
      </div>
    </div>

    <div>
      <h1>Quantization</h1>
      <div v-for="q of quantizations" :key="q.id">
        <input
          type="radio"
          :id="q.id"
          :value="q.id"
          :checked="q.id === controlsStore.selectedQuantization.id"
          @input="controlsStore.setSetQuantization(q)"
        />
        <label :for="q.id">{{ q.name }}</label>
      </div>
    </div>
  </div>
</template>
