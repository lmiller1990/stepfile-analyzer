<script lang="ts" setup>
import type { Direction, Measure, NoteLineWithPatternData } from "./types";
import Arrow from "./Arrow.vue";
import { HTMLAttributes } from "vue";
import { measureHeight } from "./uiConstants";
import { useControlsStore } from "./store/controls";

const props = defineProps<{
  measure: Measure<NoteLineWithPatternData>;
}>();

const controlsStore = useControlsStore();

const measureStyle = (lineNumber: number): HTMLAttributes["style"] => {
  const line = props.measure.notes[lineNumber - 1];
  const highlight = Array.from(line.patterns).some(
    ([pattern, quantization]) => {
      const hasPattern = controlsStore.selectedPatterns.has(pattern);
      const hasQuan =
        controlsStore.selectedQuantizationNumbers.includes(quantization);
      return hasPattern && hasQuan;
    }
  );

  return {
    background: highlight ? "rgba(172, 215, 230, 0.50)" : "none",
    height: `${measureHeight.value / props.measure.quantization}px`,
  };
};
</script>

<template>
  <div class="measure">
    <div
      v-for="line of props.measure.quantization"
      :style="measureStyle(line)"
      class="flex w-full"
      :class="{
        'measure-guide':
          line % (props.measure.quantization / 4) === 0 &&
          line !== props.measure.quantization,
      }"
    >
      <div v-for="num of [1, 2, 3, 4]" class="w-full relative" :key="num">
        <Arrow
          v-if="measure.notes[line - 1].left && num === 1"
          direction="left"
          :quantization="measure.notes[line - 1].noteQuantization"
        />

        <Arrow
          v-if="measure.notes[line - 1].down && num === 2"
          direction="down"
          :quantization="measure.notes[line - 1].noteQuantization"
        />

        <Arrow
          v-if="measure.notes[line - 1].up && num === 3"
          direction="up"
          :quantization="measure.notes[line - 1].noteQuantization"
        />

        <Arrow
          v-if="measure.notes[line - 1].right && num === 4"
          direction="right"
          :quantization="measure.notes[line - 1].noteQuantization"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.measure-guide {
  border-bottom: 1px dashed;
}

.measure {
  position: relative;
  border: 1px solid black;
  border-bottom: none;
  display: grid;
  grid-template-rows: repeat(4, 1fr);
}

.measure-debug {
  border: 1px solid red;
}

.line {
  position: absolute;
}
</style>
