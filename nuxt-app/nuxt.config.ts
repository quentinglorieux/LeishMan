export default defineNuxtConfig({
  ssr: true, // Enable or Disable SSR
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  components: true, // Ensure auto-import for components is enabled
  modules: ["@nuxt/ui", "@pinia/nuxt"],

  tailwindcss: {
    exposeConfig: true, 
  },

  nitro: {
  },

  runtimeConfig: {
    gmapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'wrong_key', 
  }

});
