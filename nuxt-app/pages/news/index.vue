<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">News</h1>
    </div>
  </section>
  <!-- <div class="flex flex-wrap justify-around mx-auto  md:grid-cols-2 lg:grid-cols-3 gap-6">
    <NewsCard v-for="news in newsItems" :key="news.id" :newsItem="news" />
  </div>
   -->
  <div class="md:p-10">
    <div class="flex flex-wrap sbt">
      <div v-for="(news, index) in newsItems" class="col">
        <CardLR
        :leftright="index % 2 == 1"
        :title="news.title"
        :imageURL="news.image"
        :abstract="news.shortdescription"
        :date="news.date"
        :seeMore="{
          label: 'Read more',
          link: `/news/${news?.title}`,
        }"
      />
      </div>
    </div>
  </div>
</template>

<script setup>
// const newsItems = ref([]);

const newsItems = await queryContent("news")
  .sort({ date: -1 }) // -1 for descending, 1 for ascending
  .find();
</script>
<style scoped></style>
