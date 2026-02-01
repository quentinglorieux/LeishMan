<template>
  <section
    class="relative overflow-hidden bg-slate-900 text-white min-h-[500px] flex items-center justify-center text-center w-full border-4 border-red-500">
    <!-- Background Image -->
    <div v-if="imageToDisplay" class="absolute inset-0 bg-cover bg-center transition-all duration-700"
      :style="{ backgroundImage: `url('${imageToDisplay}')` }" />
    <div class="absolute inset-0 bg-black/60"></div>

    <!-- Content -->
    <div class="relative px-8 py-20 sm:px-12 lg:px-16 max-w-4xl z-10">
      <p
        class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm border border-white/20">
        LeishMan Network
      </p>
      <h1 class="font-display text-4xl sm:text-5xl lg:text-7xl mb-6 shadow-black/20 text-shadow-sm">
        {{ titleToDisplay }}
      </h1>
      <p v-if="descToDisplay"
        class="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
        {{ descToDisplay }}
      </p>
      <div class="flex justify-center">
        <nuxt-link to="/about"
          class="inline-flex items-center rounded-full bg-blue-700 hover:bg-blue-600 px-10 py-4 text-sm font-semibold text-white shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          Learn More
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const heroData = ref(null)

onMounted(async () => {
  try {
    const allPages = await queryCollection('pages').all();
    heroData.value = allPages.find(p => p.stem === 'index' || p.stem === 'home') || allPages[0];
  } catch (e) {
    console.error('Failed to fetch hero data:', e);
  }
})

const titleToDisplay = computed(() => heroData.value?.title || 'Welcome to the LeishMan Network')
const descToDisplay = computed(() => heroData.value?.description || 'A European network dedicated to the optimal medical care of human leishmaniasis.')
const imageToDisplay = computed(() => heroData.value?.thumbnail || '/assets/general/banner2.webp')
</script>
