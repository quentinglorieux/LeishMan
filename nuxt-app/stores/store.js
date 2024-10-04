import { defineStore } from "pinia";

export const useLogginStore = defineStore("loggin", {
  state: () => ({
    isDark: false,
  }),
});
