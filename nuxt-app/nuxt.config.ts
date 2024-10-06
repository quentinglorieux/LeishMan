// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true, // Enable or Disable SSR
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  components: true, // Ensure auto-import for components is enabled
  modules: ["@nuxt/ui", "@pinia/nuxt"],

  tailwindcss: {
    exposeConfig: true, // This is important for Nuxt UI to use Tailwind config
  },

  nitro: {
    // preset: "netlify", // Ensures proper configuration for SSR on Netlify
  },

  runtimeConfig: {
    gmapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'wrong_key', 
    public: {
      publicApiKey: process.env.GOOGLE_MAPS_API_KEY || 'public' 
    }
  }

});
