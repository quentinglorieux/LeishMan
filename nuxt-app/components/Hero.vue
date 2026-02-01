<template>
  <section
    class="relative overflow-hidden bg-slate-900 text-white min-h-[500px] flex items-center justify-center text-center">
    <!-- Background Image -->
    <div v-if="heroImage" class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url('${heroImage}')` }" />
    <div class="absolute inset-0 bg-black/55"></div>

    <div class="relative px-8 py-20 sm:px-12 lg:px-16 max-w-4xl">
      <p
        class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm border border-white/20">
        LeishMan Network
      </p>
      <h1 class="font-display text-4xl sm:text-5xl lg:text-7xl mb-6 leading-tight">
        {{ heroTitle }}
      </h1>
      <p v-if="heroDesc"
        class="text-lg sm:text-xl text-slate-100/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        {{ heroDesc }}
      </p>
      <div class="flex justify-center mt-4">
        <nuxt-link to="/about"
          class="inline-flex items-center rounded bg-blue-700 hover:bg-blue-600 px-10 py-4 text-sm font-semibold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1">
          Learn More
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup>
// Fetch data directly in setup
const allPages = await queryCollection('pages').all();
const homePage = allPages.find(p => p.stem === 'index' || p.stem === 'home') || allPages[0];

const heroTitle = homePage?.title || 'Welcome to the LeishMan Network'
const heroDesc = homePage?.description || 'A European network dedicated to the optimal medical care of human leishmaniasis.'
const heroImage = homePage?.thumbnail || '/assets/general/banner2.webp'
</script>
