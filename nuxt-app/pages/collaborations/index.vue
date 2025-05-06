<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Collaborations</h1>
    </div>
  </section>



  <div class="p-10">
    <div class="flex flex-wrap sbt">
      <div v-for="(news, index) in collaborations" class="col">
        <CardL
          v-if="index % 2 == 1"
          :title="news.title"
          :imageURL="news.image"
          :abstract="news.description"
          :date="news.date"
          :seeMore="{
            label: 'Read more',
            link: `/collaborations/${news?.title}`,
          }"
        />
        <CardR
          v-else
          :title="news.title"
          :date="news.date"
          :imageURL="news.image"
          :abstract="news.description"
          :seeMore="{
            label: 'Read more',
            link: `/collaborations/${news?.title}`,
          }"
        />
      </div>
    </div>
  </div>


</template>

<script setup>
const collaborations = await queryContent("collaborations").find();
</script>