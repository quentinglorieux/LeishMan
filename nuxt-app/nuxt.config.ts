// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true, // Enable or Disable SSR
  nitro: {
    preset: "netlify",
    // Access map for the Cloudflare workers, generated from content at build time
    prerender: { routes: ["/data/access.json"] },
  },
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  components: true,
  modules: ["@nuxt/ui", "@nuxt/content"],
  css: ["~/assets/css/tailwind.css"],
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  },
  ui: {
    colorMode: false,
  },

  runtimeConfig: {
    public: {
      cms: process.env.CMS || "sveltia",
      // Overridable with NUXT_PUBLIC_WORKER_BASE / NUXT_PUBLIC_ORCID_AUTH_URL (e.g. local `wrangler dev`)
      workerBase: "https://nextcloud-leishman.quentin-glorieux.workers.dev",
      orcidAuthUrl: "https://orcid-sveltia.quentin-glorieux.workers.dev/auth/orcid",
    },
  },
  // nitro: {
  //   prerender: {
  //       ignore: ["/events"],
  //   },
  // },
});
