<script lang="ts" setup>
import { PatternAnalysis } from "../types";
import {
  PatternBag,
  PatternBagData,
  patternCategories,
  patterns,
} from "../patterns";
import { Quantization, quantization } from "../noteData";
import { quantizationLabel } from "../uiConstants";
import { patternsByCategory } from "../utils";

const props = defineProps<{
  analysis: Record<string, PatternAnalysis>;
}>();

interface PatternQuantizationCount {
  label: string;
  count: number;
}

const patternsByQuantization = (pattern: PatternBagData) => {
  /**
   * Map of quanization : count
   * Map([
   *   4 => 0,
   *   8 => 2,
   *   16 => 5
   *   // ... etc ...
   * ])
   */
  const countMap = Array.from(
    props.analysis[pattern.id].collection.values()
  ).reduce<Map<Quantization, number>>((acc, curr) => {
    acc.set(curr.patternQuantization, acc.get(curr.patternQuantization)! + 1);
    return acc;
  }, new Map(quantization.map((x) => [x, 0])));

  countMap.delete(0);

  for (const q of [...quantization].reverse()) {
    if (countMap.get(q) === 0) {
      countMap.delete(q);
    } else {
      return Array.from(countMap.entries()).map<PatternQuantizationCount>(
        ([q, count]) => ({
          label: quantizationLabel(q),
          count,
        })
      );
    }
  }

  return [];
};

const patternQuantizationCounts: Map<string, PatternQuantizationCount[]> =
  new Map();

for (const patternData of patternsByCategory) {
  for (const pattern of patternData.data) {
    for (const q of patternsByQuantization(pattern)) {
      const exists = patternQuantizationCounts.get(pattern.id);
      if (exists) {
        patternQuantizationCounts.set(pattern.id, [...exists, q]);
      } else {
        patternQuantizationCounts.set(pattern.id, [q]);
      }
    }
  }
}

// function style (pattern: PatternBagData) {
//   const fallback = 'grid-template-rows: repeat(4, 1fr)'
//   const count = patternQuantizationCounts.get(pattern.id)?.length

//   if (!count || count >= 4) {
//     return fallback
//   }

//   return `grid-template-rows: repeat(${count}, 1fr)`
// }
</script>

<template>
  <h1>Summary</h1>

  <div v-for="patternData of patternsByCategory" :key="patternData.category">
    <h1 class="text-left my-4">{{ patternData.category }}</h1>

    <div>
      <div v-for="pattern of patternData.data" :key="pattern.id">
        <h3 class="text-lg">{{ pattern.label }}</h3>

        <!-- :style="style(pattern)" -->
        <ul class="pattern-container ml-2 mb-2">
          <li
            v-for="q of patternQuantizationCounts.get(pattern.id)"
            :key="q.label"
          >
            {{ q.label }}: {{ q.count }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pattern-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-flow: column;
  /* grid-template-rows: 1fr 1fr; */
}
</style>
