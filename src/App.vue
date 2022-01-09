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
import { quantization } from "./noteData";
import { chart, uberRave } from "./chart";
import ControlPanel from "./ControlPanel.vue";
import { measureHeight } from './uiConstants'
import Arrow from "./Arrow.vue";
import MeasureC from "./Measure.vue";

const data = parse(chart);
const analysis = analyzePatterns(
  createAnalysisResults(patterns),
  data.lines,
  data.measures,
  patterns
);
const measures = addPatternDataToMeasures(data.measures, analysis);

const quantizations = quantization.map((x) => ({
  id: `q-${x}`,
  quantization: x,
  name: x === 32 || 192 ? `${x}nd` : `${x}th`,
}));

const selectedPattern = ref<string>("urd-candle");
const selectedQuantization = ref<typeof quantizations[number]>(
  quantizations[0]
);

const positions = new Map<Direction, number>([
  ["left", 0],
  ["down", 1],
  ["up", 2],
  ["right", 3],
]);

const measureWidth = 100;

// const noteStyle = (note: NoteLineWithPatternData, direction: Direction) => {
//   return {
//     left: `${(measureWidth / 4) * positions.get(direction)!}px`,
//     width: `${measureWidth / 4}px`,
//     height: `${measureHeight / 16}`,
//   };
// };

// const measureStyle = (
//   lineNumber: number,
//   measure: Measure<NoteLineWithPatternData>
// ): HTMLAttributes["style"] => {
//   const line = measure.notes[lineNumber - 1];
//   const desiredPatternQuantization = line.patterns.get(selectedPattern.value)!;
//   const highlight =
//     desiredPatternQuantization === selectedQuantization.value.quantization;

//   return {
//     top: `${(measureHeight / measure.quantization) * (lineNumber - 1)}px`,
//     background: highlight ? "rgba(172, 215, 230, 0.50)" : "none",
//     height: `${measureHeight / measure.quantization}px`,
//   };
// };

function setQuantization(q: typeof quantizations[number]) {
  selectedQuantization.value = q;
}
</script>

<template>
  <div id="main-container">
    <div id="chart-container" class="border border-2">
      <div id="measure-container">

        <MeasureC
          v-for="measure of measures"
          :measure="measure"
          :key="measure.number"
        />
          <!-- :style="{ height: `${measureHeight}px`, width: `${measureWidth}px` }" -->
        <!--
        <div
          class="measure"
          v-for="measure of measures"
          :key="measure.number"
          :style="{ height: `${measureHeight}px`, width: `${measureWidth}px` }"
        >

          <div
            v-for="line of measure.quantization"
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
                :quantization="measure.notes[line - 1].noteQuantization"
              />
            </div>

            <div
              v-if="measure.notes[line - 1].down"
              class="note"
              :style="noteStyle(measure.notes[line - 1], 'down')"
            >
              <Arrow
                direction="down"
                :quantization="measure.notes[line - 1].noteQuantization"
              />
            </div>

            <div
              v-if="measure.notes[line - 1].up"
              class="note"
              :style="noteStyle(measure.notes[line - 1], 'up')"
            >
              <Arrow
                direction="up"
                :quantization="measure.notes[line - 1].noteQuantization"
              />
            </div>

            <div
              v-if="measure.notes[line - 1].right"
              class="note"
              :style="noteStyle(measure.notes[line - 1], 'right')"
            >
              <Arrow
                direction="right"
                :quantization="measure.notes[line - 1].noteQuantization"
              />
            </div>
          </div>
        </div>
        -->

      </div> 
    </div>

    <div id="controls-container" class="border border-2">
      <ControlPanel />
    </div>

    <div id="bottom-half" class="border border-2">
      bottom
    </div>
  </div>

  <!-- <div class="flex"> -->

    <!-- 
    -->

  <!-- </div> -->
</template>

<style scoped>
.note {
  position: absolute;
}

* {
  box-sizing: content-box;
}

#main-container {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 5fr 1fr;
  height: 100vh;
}

#chart-container {
  overflow: scroll;
}

#bottom-half {
  grid-column-start: 1;
  grid-column-end: 3;
}

#measure-container {
  margin: 50px 0 0 0;
  height: 100%;
  width: 200px;
  display: grid;
  grid-template-columns: 1fr;
  /* gap: 2px; */
  grid-auto-rows: v-bind("measureHeight.px");
}
</style>
