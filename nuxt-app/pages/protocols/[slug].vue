<template>
    <div class="w-4/5 justify-center mx-auto">
      <h1 class="text-4xl font-bold my-8">{{ newsItem?.title }}</h1>
      <img :src="newsItem?.image" :alt="newsItem?.title" class="w-full h-64 object-cover mb-6" />
  
      <!-- Plaintext version -->
  
      <!-- Render markdown correctly -->
      <div class="prose dark:prose-invert" v-html="renderedHtml" />
    </div>
  </template>
  
  
    <script setup>
  import MarkdownIt from 'markdown-it'
  const route = useRoute()
  
  const newsItem = await queryContent("protocols").where({title:route.params.slug}).findOne();
  const md = new MarkdownIt()
  
  const renderedHtml = md.render(newsItem?.description , "")
    </script>
  
  