<script setup lang="ts">
import { ref } from 'vue';
import { analyzePatterns, createAnalysisResults, parse } from './analysis'
import { patterns } from './patterns';

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
0000
0000
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
`

const data = parse(raw)
console.log(data)
const analysis = analyzePatterns(createAnalysisResults(patterns), data.lines, patterns)
console.log(analysis)

const selectedPattern = ref<string>("urd-candle")
</script>

<template>
  <div class="measure" v-for="measure of data.measures" :key="measure.number"> 
    <div 
      v-for="line of measure.quantitization" 
      class="line"
      :key="line"
      :style="{ top: `${(400 / measure.quantitization) * (line - 1)}px`}"
    >
      <div 
        v-if="measure.notes[line - 1].left"
        class="note"
        :style="`left: ${(100 / 4) * 0}px`"
      >
        {{ "<" }}
      </div>

      <div 
        v-if="measure.notes[line - 1].down"
        class="note"
        :style="`left: ${(100 / 4) * 1}px`"
      >
        {{ "v" }}
      </div>

      <div 
        v-if="measure.notes[line - 1].up"
        class="note"
        :style="`left: ${(100 / 4) * 2}px`"
      >
        {{ "^" }}
      </div>

      <div 
        v-if="measure.notes[line - 1].right" 
        class="note"
        :style="`left: ${(100 / 4) * 3}px`"
      >
        {{ ">" }}
      </div>
    </div>
  </div>

  <h1>Patterns</h1>
    <div
      v-for="[name, obj] of Object.entries(patterns)" 
      :key="name"
    >
    <input :id="name" :value="name" type="radio" v-model="selectedPattern">
    <label :for="name">{{ name }}</label>
  </div>
</template>

<style scoped>
.note {
  position: absolute;
}

.line {
  position: absolute;
}

.measure {
  position: relative;
  height: 400px;
  width: 100px;
  border: 1px solid black;
}
</style>
