<template>
  <div
    v-if="data.hero"
    class="relative bg-cover bg-center h-[500px] pt-16 z-1"
    :style="{ backgroundImage: `url(${data.hero?.heroImage})` }"
  >
    <div class="absolute inset-0 bg-black opacity-50"></div>
    <div
      class="relative flex flex-col items-center justify-center text-center text-white h-full"
    >
      <h1 class="text-5xl font-bold">{{ data.hero?.title }}</h1>
      <p class="mt-4 text-lg">{{ data.hero?.subtitle }}</p>
      <nuxt-link
        to="/about"
        class="mt-6 bg-pasteur-blue hover:bg-pasteur-dark text-white px-6 py-3 rounded-full"
      >
        Learn More
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const data = ref({});

onMounted(async () => {
  try {
    const response = await fetch("/data/home.json");
    data.value = await response.json();
  } catch (error) {
    console.error("Error loading the JSON:", error);
  }
});
</script>
