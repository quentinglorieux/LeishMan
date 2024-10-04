// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  // ssr: true, // Enable SSR
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  components: true, // Ensure auto-import for components is enabled
  modules: [
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@primevue/nuxt-module'
  ],
  tailwindcss: {
    exposeConfig: true, // This is important for Nuxt UI to use Tailwind config
  },
  css: [
    '@/assets/css/tailwind.css',
    'primeicons/primeicons.css', // PrimeIcons
  ],
  nitro: {
    preset: 'netlify' // Ensures proper configuration for SSR on Netlify
  },
  primevue: {
      options: {
          theme: {
              preset: Aura
          }
      }
  }
})