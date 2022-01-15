import { readonly, ref } from "vue";

const error = ref<string | undefined>();

export function useError() {
  return {
    setError: (msg: string | undefined) => (error.value = msg),
    error: readonly(error),
  };
}
