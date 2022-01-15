<script lang="ts" setup>
import { useError } from "../composables/useError";

const { error } = useError();
</script>

<template>
  <div class="bg-red-300 p-4">{{ error }}</div>
</template>
