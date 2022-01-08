<script lang="ts" setup>
import { rootCertificates } from "tls";
import type { Direction } from "./types";

const props = defineProps<{
  direction: Direction;
}>();

let rotation: `${0 | 90 | 180 | 270}deg` = "0deg";

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

const style = {
  transform: `rotate(${rotation})`
}
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="style"
  >
    <path d="M0 45H95V55H0V45Z" fill="black" />
    <path
      d="M46 89.6691L92.669 43L99.7401 50.0711L53.0711 96.7401L46 89.6691Z"
      fill="black"
    />
    <path
      d="M92.6691 56.7401L46 10.0711L53.0711 3L99.7401 49.669L92.6691 56.7401Z"
      fill="black"
    />
  </svg>
</template>
