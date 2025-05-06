<template>
  <section class="py-12 bg-gray-100 dark:bg-slate-600">
    <div class="container mx-auto px-10">
      <h2 class="text-3xl font-bold mb-6">Latest News</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        <NewsCard v-for="news in newsList.slice(0,2)" :key="news.id" :newsItem="news" />
      </div>
    </div>

    <div class="mt-8 text-center">
      <nuxt-link
        to="/news"
        class="bg-pasteur-blue text-white px-6 py-3 rounded hover:bg-pasteur-dark"
        >View All News</nuxt-link
      >
    </div>
  </section>
</template>

<script setup>
const newsList = await queryContent("news").sort({date:-1}).find();
</script>