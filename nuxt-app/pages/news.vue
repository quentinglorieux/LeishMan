<template>
  <Titleheader title="News"> </Titleheader>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    <NewsCard v-for="news in newsItems" :key="news.id" :newsItem="news" />
  </div>
</template>

<script setup>
const newsItems = ref([]);

onMounted(async () => {
  try {
    const newsResponse = await fetch("/data/news.json");
    const newsData = await newsResponse.json();
    newsItems.value = newsData.news.slice(0, 3); // Display the first 3 news items
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});
</script>
