// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true, // Enable or Disable SSR
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  components: true,
  modules: ["@nuxt/ui"],

  tailwindcss: {
    exposeConfig: true,
  },

  runtimeConfig: {
    gmapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "wrong_key",
    public: {
      publicApiKey: process.env.GOOGLE_MAPS_API_KEY || "public",
      cms: process.env.CMS || "sveltia",
    },
  },
});
