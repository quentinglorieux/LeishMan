<template>
  <section class="py-12 bg-gray-100">
    <div class="container mx-auto px-10">
      <h2 class="text-3xl font-bold mb-6">Latest News</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        <NewsCard v-for="news in newsItems" :key="news.id" :newsItem="news" />
      </div>
    </div>
  </section>
</template>

<script setup>
const newsItems = ref([]);

onMounted(async () => {
  try {
    const newsResponse = await fetch("/data/news.json");
    const newsData = await newsResponse.json();
    newsItems.value = newsData.news.slice(0, 2); // Display the first 3 news items
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});
</script>
