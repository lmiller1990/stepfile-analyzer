<script lang="ts" setup>
import { computed, ref } from "vue";
import type { Quantization } from "../noteData";
import type { Direction } from "../types";

const props = defineProps<{
  direction: Direction;
  quantization: Quantization;
}>();

let rotation: `${0 | 90 | 180 | 270}deg` = "0deg";

const colors: Map<Quantization, string> = new Map([
  [4, "red"],
  [8, "blue"],
  [12, "lime"],
  [16, "rgb(231, 225, 61)"],
  [24, "purple"],
  [32, "aqua"],
  [48, "pink"],
  [64, "darkgreen"],
  [192, "darkgreen"],
]);

switch (props.direction) {
  case "left":
    rotation = "180deg";
    break;
  case "down":
    rotation = "90deg";
    break;
  case "up":
    rotation = "270deg";
    break;
  case "right":
    rotation = "0deg";
    break;
}

const fill = colors.get(props.quantization);

const root = ref<SVGElement>();

const style = computed(() => {
  const top = root.value ? root.value.getBoundingClientRect().height / 2 : 0;
  return {
    transform: `rotate(${rotation})`,
    // top: `-${top}px`,
  };
});
</script>

<template>
  <svg
    ref="root"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="style"
  >
    <path d="M0 45H95V55H0V45Z" :fill="fill" />
    <path
      d="M46 89.6691L92.669 43L99.7401 50.0711L53.0711 96.7401L46 89.6691Z"
      :fill="fill"
    />
    <path
      d="M92.6691 56.7401L46 10.0711L53.0711 3L99.7401 49.669L92.6691 56.7401Z"
      :fill="fill"
    />
  </svg>
</template>

<style scoped>
svg {
  position: absolute;
  z-index: 1;
}
</style>
