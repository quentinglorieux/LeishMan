<template>

  <div
  v-if="data && data.thumbnail"
  class="relative bg-cover bg-center h-[500px] pt-16 z-1"
  :style="{ backgroundImage: `url(${data.thumbnail})` }"
>
  <div class="absolute inset-0 bg-black opacity-50"></div>
  <div class="relative flex flex-col items-center justify-center text-center text-white h-full">
    <h1 class="text-5xl font-bold">{{ data.title }}</h1>
    <p class="mt-4 text-lg">{{ data.description }}</p>
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
const dataraw = await queryContent("pages").find();
const data = dataraw[0];

</script>
