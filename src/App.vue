<script setup lang="ts">
import { ref } from "vue";
import {
  addPatternDataToMeasures,
  analyzePatterns,
  createAnalysisResults,
  parse,
} from "./analysis";
import { patterns } from "./patterns";
import { Direction, NoteLineWithPatternData } from "./types";
import { chart } from "./chart";
import Arrow from "./Arrow.vue";

// const raw = `0010
// 0001
// 0100
// 0010
// 1000
// 0100
// 1000
// 0010
// 0100
// 0001
// 0010
// 0000
// 1000
// 1000
// 0000
// 0000
// ,
// 0010
// 0001
// 0100
// 0010
// 1000
// 0100
// 1000
// 0010
// ,
// `;

const raw = chart;

const data = parse(raw);
const analysis = analyzePatterns(
  createAnalysisResults(patterns),
  data.lines,
  patterns
);
const measures = addPatternDataToMeasures(data.measures, analysis);

const selectedPattern = ref<string>("urd-candle");

const positions = new Map<Direction, number>([
  ["left", 0],
  ["down", 1],
  ["up", 2],
  ["right", 3],
]);

const measureWidth = 100;
const measureHeight = 400;

const style = (note: NoteLineWithPatternData, direction: Direction) => {
  return {
    left: `${(measureWidth / 4) * positions.get(direction)!}px`,
    width: `${measureWidth / 4}px`,
    height: `${measureHeight / 16}`,
    background: note.patterns.has(selectedPattern.value) ? "red" : "none",
  };
};
</script>

<template>
  <div
    class="measure"
    v-for="measure of measures"
    :key="measure.number"
    :style="{ height: `${measureHeight}px`, width: `${measureWidth}px` }"
  >
    <div
      v-for="line of measure.quantitization"
      class="line"
      :key="line"
      :style="{
        top: `${(measureHeight / measure.quantitization) * (line - 1)}px`,
      }"
    >
      <div
        v-if="measure.notes[line - 1].left"
        class="note"
        :style="style(measure.notes[line - 1], 'left')"
      >
        <Arrow
          direction="left"
          :quantitization="measure.notes[line - 1].noteQuantitization"
        />
      </div>

      <div
        v-if="measure.notes[line - 1].down"
        class="note"
        :style="style(measure.notes[line - 1], 'down')"
      >
        <Arrow
          direction="down"
          :quantitization="measure.notes[line - 1].noteQuantitization"
        />
      </div>

      <div
        v-if="measure.notes[line - 1].up"
        class="note"
        :style="style(measure.notes[line - 1], 'up')"
      >
        <Arrow
          direction="up"
          :quantitization="measure.notes[line - 1].noteQuantitization"
        />
      </div>

      <div
        v-if="measure.notes[line - 1].right"
        class="note"
        :style="style(measure.notes[line - 1], 'right')"
      >
        <Arrow
          direction="right"
          :quantitization="measure.notes[line - 1].noteQuantitization"
        />
      </div>
    </div>
  </div>

  <h1>Patterns</h1>
  <div v-for="[name, obj] of Object.entries(patterns)" :key="name">
    <input :id="name" :value="name" type="radio" v-model="selectedPattern" />
    <label :for="name">{{ name }}</label>
  </div>
</template>

<style scoped>
.note {
  position: absolute;
  background: blue;
}

.line {
  position: absolute;
  border-bottom: 1px dashed black;
  display: flex;
  width: 100%;
}

.measure {
  position: relative;
  /* height: 400px;
  width: 100px; */
  border: 1px solid black;
}

* {
  box-sizing: content-box;
}
</style>
