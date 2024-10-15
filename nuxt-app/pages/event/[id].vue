<template>
 <div class="container mx-auto py-8">
  <h1 class="text-3xl font-bold text-center mb-8">LeishMan Program</h1>
  </div>
    <ProgDisplay :programData="programJson" />
  </template>
  
  <script setup>
  const route = useRoute()
  
  // Reactive state to hold the dynamically fetched JSON data
const programJson = ref([])

onMounted(async () => {
  try {
    // Fetch the JSON data dynamically (e.g., from a file or API)
    const response = await fetch(`/data/meetings/${route.params.id}.json`);
        programJson.value = await response.json() // Store the JSON data in the reactive variable
  } catch (error) {
    console.error('Error fetching program data:', error)
  }
})  </script>
  