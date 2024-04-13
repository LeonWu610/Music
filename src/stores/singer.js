import { defineStore } from "pinia";
import { ref } from "vue";

export const useSingerStore = defineStore('singer', () => {
  const picUrl = ref()
  const name = ref()
  return { picUrl, name }
})