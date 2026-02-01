<template>
  <section class="py-12">
    <div>
      <h2 class="font-display text-3xl mb-6">Latest News</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NewsCard v-for="news in newsList" :key="news.id" :newsItem="news" />
      </div>
    </div>

    <div class="mt-8 text-center">
      <nuxt-link to="/news" class="bg-pasteur-blue text-white px-6 py-3 rounded hover:bg-pasteur-dark">View All
        News</nuxt-link>
    </div>
  </section>
</template>

<script setup>
const newsItems = await queryCollection('news').order('date', 'DESC').all();
const newsList = newsItems.slice(0, 3);
</script>