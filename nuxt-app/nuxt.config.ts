// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true, // Enable or Disable SSR
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  components: true, 
  modules: ["@nuxt/ui", "@pinia/nuxt"],

  tailwindcss: {
    exposeConfig: true, 
  },

  runtimeConfig: {
    gmapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'wrong_key', 
    public: {
      publicApiKey: process.env.GOOGLE_MAPS_API_KEY || 'public',
      cms: process.env.CMS || 'sveltia',
    }
  }

});
