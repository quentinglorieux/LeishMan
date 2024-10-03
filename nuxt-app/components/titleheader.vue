<template>
  <h1
    class="mt-2 mb-4 text-2xl text-center font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl lg:text-4xl dark:text-white"
  >
    {{ title }}
  </h1>
</template>
<script setup>
defineProps({
  title: String,
});
</script>
