<template>
    <div>
      <h1 class="text-4xl font-bold my-8">{{ newsItem.title }}</h1>
      <img :src="newsItem.image" :alt="newsItem.title" class="w-full h-64 object-cover mb-6">
      <p class="text-gray-700">{{ newsItem.content }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  
  const route = useRoute()
  const newsItem = ref({})
  
  onMounted(async () => {
    const response = await fetch('/data/news.json')
    const data = await response.json()
    newsItem.value = data.news.find(item => item.id === parseInt(route.params.id))
  })
  </script>
  