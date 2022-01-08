<script setup lang="ts">
import { HTMLAttributes, ref } from "vue";
import {
  addPatternDataToMeasures,
  analyzePatterns,
  createAnalysisResults,
  parse,
} from "./analysis";
import { patterns } from "./patterns";
import type { Direction, Measure, NoteLineWithPatternData } from "./types";
import { quantitization } from "./noteData";
import { chart } from "./chart";
import Arrow from "./Arrow.vue";

const data = parse(chart);
const analysis = analyzePatterns(
  createAnalysisResults(patterns),
  data.lines,
  data.measures,
  patterns
);
const measures = addPatternDataToMeasures(data.measures, analysis);

const quantitizations = quantitization.map((x) => ({
  id: `q-${x}`,
  quantitization: x,
  name: x === 32 || 192 ? `${x}nd` : `${x}th`,
}));

const selectedPattern = ref<string>("urd-candle");
const selectedQuantitization = ref<typeof quantitizations[number]>(
  quantitizations[0]
);

const positions = new Map<Direction, number>([
  ["left", 0],
  ["down", 1],
  ["up", 2],
  ["right", 3],
]);

const measureWidth = 100;
const measureHeight = 350;

const noteStyle = (note: NoteLineWithPatternData, direction: Direction) => {
  return {
    left: `${(measureWidth / 4) * positions.get(direction)!}px`,
    width: `${measureWidth / 4}px`,
    height: `${measureHeight / 16}`,
  };
};

const measureStyle = (
  lineNumber: number,
  measure: Measure<NoteLineWithPatternData>
): HTMLAttributes["style"] => {
  const line = measure.notes[lineNumber - 1];
  const desiredPatternQuantitization = line.patterns.get(
    selectedPattern.value
  )!;
  const highlight =
    desiredPatternQuantitization ===
    selectedQuantitization.value.quantitization;

  return {
    top: `${(measureHeight / measure.quantitization) * (lineNumber - 1)}px`,
    background: highlight ? "rgba(172, 215, 230, 0.50)" : "none",
    height: `${measureHeight / measure.quantitization}px`,
  };
};

function setQuantitization(q: typeof quantitizations[number]) {
  selectedQuantitization.value = q;
}
</script>

<template>
  <div class="flex">
    <div>
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
        :style="measureStyle(line, measure)"
      >
        <div
          v-if="measure.notes[line - 1].left"
          class="note"
          :style="noteStyle(measure.notes[line - 1], 'left')"
        >
          <Arrow
            direction="left"
            :quantitization="measure.notes[line - 1].noteQuantitization"
          />
        </div>

        <div
          v-if="measure.notes[line - 1].down"
          class="note"
          :style="noteStyle(measure.notes[line - 1], 'down')"
        >
          <Arrow
            direction="down"
            :quantitization="measure.notes[line - 1].noteQuantitization"
          />
        </div>

        <div
          v-if="measure.notes[line - 1].up"
          class="note"
          :style="noteStyle(measure.notes[line - 1], 'up')"
        >
          <Arrow
            direction="up"
            :quantitization="measure.notes[line - 1].noteQuantitization"
          />
        </div>

        <div
          v-if="measure.notes[line - 1].right"
          class="note"
          :style="noteStyle(measure.notes[line - 1], 'right')"
        >
          <Arrow
            direction="right"
            :quantitization="measure.notes[line - 1].noteQuantitization"
          />
        </div>
      </div>
    </div>
    </div>

    <div class="flex">
      <div>
        <h1>Patterns</h1>
        <div v-for="name of Object.keys(patterns)" :key="name">
          <input
            :id="name"
            :value="name"
            type="radio"
            v-model="selectedPattern"
          />
          <label :for="name">{{ name }}</label>
        </div>
      </div>
    </div>

    <div>
      <h1>Quantitization</h1>
      <div v-for="q of quantitizations" :key="q.id">
        <input
          type="radio"
          :id="q.id"
          :value="q.id"
          :checked="q.id === selectedQuantitization.id"
          @input="setQuantitization(q)"
        />
        <label :for="q.id">{{ q.name }}</label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note {
  position: absolute;
}

.line {
  position: absolute;
  border-bottom: 1px dashed black;
  display: flex;
  width: 100%;
}

.measure {
  position: relative;
  border: 1px solid black;
}

* {
  box-sizing: content-box;
}
</style>
