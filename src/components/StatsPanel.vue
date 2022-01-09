<script lang="ts" setup>
import { PatternAnalysis } from "../types";
import { patterns } from "../patterns";
import { Quantization, quantization } from "../noteData";
import { quantizationLabel, quantizations } from "../uiConstants";

const props = defineProps<{
  analysis: Record<string, PatternAnalysis>;
}>();

console.log(props.analysis);

const patternsByQuantization = (pattern: string) => {
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
    props.analysis[pattern].collection.values()
  ).reduce<Map<Quantization, number>>((acc, curr) => {
    acc.set(curr.patternQuantization, acc.get(curr.patternQuantization)! + 1);
    return acc;
  }, new Map(quantization.map((x) => [x, 0])));

  countMap.delete(0)

  for (const q of [...quantization].reverse()) {
    if (countMap.get(q) === 0) {
      countMap.delete(q);
    } else {
      return Array.from(countMap.entries()).map<{
        label: string;
        count: number;
      }>(([q, count]) => ({
        label: quantizationLabel(q),
        count,
      }));
    }
  }
};
</script>

<template>
  <div v-for="pattern of Object.keys(patterns)" :key="pattern">
    <div>{{ pattern }} ({{ props.analysis[pattern].count }})</div>
    {{}}
    <ul>
      <li
        class="ml-4"
        v-for="q of patternsByQuantization(pattern)"
        :key="q.label"
      >
        {{ q.label }}: {{ q.count }}
      </li>
    </ul>
  </div>
</template>

<style scoped></style>
