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

const raw = `0010
0001
0100
0010
1000
0100
1000
0010
0100
0001
0010
0000
1000
1000
0000
0000
,
0010
0001
0100
0010
1000
0100
1000
0010
,
`;

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

const style = (note: NoteLineWithPatternData, direction: Direction) => {
  return {
    left: `${(100 / 4) * positions.get(direction)!}px`,
    background: note.patterns.has(selectedPattern.value) ? 'red' : 'white'
  }
};

</script>

<template>
  <div class="measure" v-for="measure of measures" :key="measure.number">
    <div
      v-for="line of measure.quantitization"
      class="line"
      :key="line"
      :style="{
        top: `${(400 / measure.quantitization) * (line - 1)}px`,
      }"
    >
      <div
        v-if="measure.notes[line - 1].left"
        class="note"
        :style="style(measure.notes[line - 1], 'left')"
      >
        {{ "<" }}
      </div>

      <div
        v-if="measure.notes[line - 1].down"
        class="note"
        :style="style(measure.notes[line - 1], 'down')"
      >
        {{ "v" }}
      </div>

      <div
        v-if="measure.notes[line - 1].up"
        class="note"
        :style="style(measure.notes[line - 1], 'up')"
      >
        {{ "^" }}
      </div>

      <div
        v-if="measure.notes[line - 1].right"
        class="note"
        :style="style(measure.notes[line - 1], 'right')"
      >
        {{ ">" }}
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
}

.line {
  position: absolute;
  border-bottom: 1px dashed black;
  display: flex;
  width: 100%;
}

.measure {
  position: relative;
  height: 400px;
  width: 100px;
  border: 1px solid black;
}
</style>
