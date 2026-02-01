<template>
  <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">News</p>
      <h1 class="font-display text-3xl sm:text-4xl">News</h1>
      <p class="mt-3 max-w-2xl text-sm text-slate-600">
        Updates, announcements, and network activities.
      </p>
    </div>
  </section>
  <!-- <div class="flex flex-wrap justify-around mx-auto  md:grid-cols-2 lg:grid-cols-3 gap-6">
    <NewsCard v-for="news in newsItems" :key="news.id" :newsItem="news" />
  </div>
   -->
  <div class="mt-10 space-y-6">
    <div class="flex flex-col gap-6">
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

const newsItems = await queryCollection("news")
  .order("date", "DESC")
  .all();
</script>
<style scoped></style>
