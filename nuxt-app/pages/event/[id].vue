<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold text-center mb-8">
      October 18th 2024 Program
    </h1>
  </div>
  <ProgDisplay :programData="seminars[0].talk" />
</template>

<script setup>
const route = useRoute();

// Reactive state to hold the dynamically fetched JSON data
const programJson = ref([]);
const date = route.params.id;
const seminars = await queryContent("events").where({ date: date }).find();
</script>
