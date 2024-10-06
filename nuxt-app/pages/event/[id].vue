<template>
    <div>
      <h1 class="text-4xl font-bold my-8">{{ eventsItem.title }}</h1>
      <p class="text-gray-700">{{ eventsItem.description }}</p>
    </div>
  </template>
  
  <script setup>
  const route = useRoute()
  const eventsItem = ref({})
  
  onMounted(async () => {
    const response = await fetch('/data/events.json')
    const data = await response.json()
    eventsItem.value = data.events.find(item => item.id === parseInt(route.params.id))
  })
  </script>
  