// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true, // Enable SSR
  compatibilityDate: "2024-04-03",

  devtools: { enabled: true },
  components: true, // Ensure auto-import for components is enabled
  modules: ["@nuxt/ui", "@pinia/nuxt"],

  tailwindcss: {
    exposeConfig: true, // This is important for Nuxt UI to use Tailwind config
  },

  nitro: {
    preset: "netlify", // Ensures proper configuration for SSR on Netlify
  },

  runtimeConfig: {
    apiSecret: process.env.GMAP_API_KEY,
  },
});
