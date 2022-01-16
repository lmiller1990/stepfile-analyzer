<script lang="ts" setup>
import { ref } from "vue";
import { compileSSC } from "../sscParser";
import { useChartStore } from "../store/chart";

const chartStore = useChartStore();

const file = ref<HTMLInputElement>();

async function handleUpload() {
  if (!file.value?.files?.[0]) {
    return;
  }

  const sscData = await file.value.files[0].text();
  const song = compileSSC(sscData);
  chartStore.setSong(song);
}
</script>

<template>
  <div class="flex items-center justify-center">
    <input type="file" @change="handleUpload" ref="file" />
  </div>
</template>

<style scoped></style>
