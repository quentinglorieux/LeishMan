<template>
    <div>
      <h1 class="text-4xl font-bold my-8">{{ newsItem.title }}</h1>
      <img :src="newsItem.image" :alt="newsItem.title" class="w-full h-64 object-cover mb-6">
      <p class="text-gray-700">{{ newsItem.content }}</p>
    </div>
  </template>
  
  <script setup>
  const route = useRoute()

  const newsItem = await queryContent("news").where({title:route.params.id}).findOne();
 
  </script>
  