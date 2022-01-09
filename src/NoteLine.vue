<script lang="ts" setup>
import { HTMLAttributes } from 'vue';
import { Measure, NoteLineWithPatternData } from './types';

const measureHeight = 400

const props = defineProps<{
  line: number
  measure: Measure<NoteLineWithPatternData>
}>()

const measureStyle = (): HTMLAttributes["style"] => {
  const line = props.measure.notes[props.line - 1];
  // const desiredPatternQuantization = line.patterns.get(selectedPattern.value)!;
  const highlight = false
  //   desiredPatternQuantization === selectedQuantization.value.quantization;

  return {
    top: `${(measureHeight / props.measure.quantization) * (props.line - 1)}px`,
    background: highlight ? "rgba(172, 215, 230, 0.50)" : "none",
    height: `${measureHeight / props.measure.quantization}px`,
  };
};

</script>

<template>
  <div 
    :style="measureStyle"
    class="line"
    >
  </div>
</template>

<style scoped>
.line {
  position: relative;
  border-bottom: 1px dashed black;
  display: flex;
  width: 100%;
}

</style>