<template>
  <Titleheader title="News"> </Titleheader>
  <div class="flex flex-wrap justify-around mx-auto  md:grid-cols-2 lg:grid-cols-3 gap-6">
    <NewsCard v-for="news in newsItems" :key="news.id" :newsItem="news" />
  </div>
</template>

<script setup>
// const newsItems = ref([]);

const newsItems = await queryContent("news")
  .sort({ date: -1 })  // -1 for descending, 1 for ascending
  .find()
  </script>
