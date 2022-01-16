<script lang="ts" setup>
import type { Measure, NoteLineWithPatternData } from "../types";
import Arrow from "./Arrow.vue";
import { measureHeight } from "../uiConstants";
import { useControlsStore } from "../store/controls";
import { HTMLAttributes } from "vue";

const props = defineProps<{
  measure: Measure<NoteLineWithPatternData>;
}>();

const controlsStore = useControlsStore();

const highlightHeight = `${measureHeight.value / 8}px`;

const measureStyle = (idx: number) => {
  return {
    // background: controlsStore.linesToHighlight.includes(props.measure.startingLineNumber + idx) ? "rgba(172, 215, 230, 0.50)" : "none",
    height: `${measureHeight.value / props.measure.quantization}px`,
  };
};

const highlightStyle = (line: number, idx: number): HTMLAttributes["style"] => {
  //  w-full h-full
  const highlightData = controlsStore.linesToHighlight.get(
    props.measure.startingLineNumber + idx
  );

  if (!highlightData) {
    return {};
  }

  const background = "rgba(172, 215, 230, 0.50)";
  const height = highlightData.isLastLine ? "50px" : "100%";

  return {
    background,
    width: "100%",
    height,
  };
};
</script>

<template>
  <div class="measure">
    <div class="absolute text-xs pl-1">{{ props.measure.number }}</div>
    <div
      v-for="(line, idx) of props.measure.quantization"
      :data-line-id="line"
      :style="measureStyle(idx)"
      class="flex w-full relative"
      :class="{
        'measure-guide':
          line % (props.measure.quantization / 4) === 0 &&
          line !== props.measure.quantization,
      }"
    >
      <div class="absolute" :style="highlightStyle(line, idx)" />
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

.highlight-pattern {
  background: rgba(172, 215, 230, 0.5);
  height: v-bind("highlightHeight");
}
</style>
