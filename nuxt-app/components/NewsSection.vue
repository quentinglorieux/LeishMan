<template>
  <section class="py-12 bg-gray-100 dark:bg-slate-600">
    <div class="container mx-auto px-10">
      <h2 class="text-3xl font-bold mb-6">Latest News</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        <NewsCard v-for="news in newsList" :key="news.id" :newsItem="news" />
      </div>
    </div>
  </section>
</template>

<script setup>
const newsList = await queryContent("news").find();
</script>
