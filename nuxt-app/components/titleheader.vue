<template>
  <h1
    class="font-display mt-2 mb-6 text-center text-3xl leading-tight text-slate-900 md:text-4xl lg:text-5xl"
  >
    {{ title }}
  </h1>
</template>
<script setup>
defineProps({
  title: String,
});
</script>
