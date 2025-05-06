<template>
        <section class="bg-pasteur-blue text-white py-16">
      <div class="container mx-auto text-center">
        <h1 class="text-4xl font-bold">Projects</h1>

      </div>
    </section>


    <div class="p-10">
      <div class="flex flex-wrap sbt">
        <div v-for="(news, index) in projectsList" class="col">
          <CardL
            v-if="index % 2 == 1"
            :title="news.title"
            :imageURL="news.image"
            :abstract="news.description"
            :date="news.date"
            :seeMore="{
              label: 'Read more',
              link: `/projects/${news?.title}`,
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
              link: `/projects/${news?.title}`,
            }"
          />
        </div>
      </div>
    </div>
<!-- 
    <div id="project" class="py-10 bg-white text-gray-800 dark:bg-slate-500">
      <div>
        <div class="md:w-9/12 mx-auto">
          <UCarousel
            v-slot="{ item, index }"
            :items="projectsList"
            width="300"
            height="400"
            draggable="false"
            :ui="{ item: 'basis-full md:basis-1/2 lg:basis-1/3' }"
            class="overflow-hidden p-10"
            indicators
          >
            <div class="text-center mx-auto">
              <div class="mt-1 mb-5">
                <h2 class="text-xl text-center font-bold">{{ item.title }}</h2>
              </div>
              <img
                :src="item.image"
                :alt="item.description"
                class="h-72 md:h-96 mx-auto"
                draggable="false"
                arrows
              />
            </div>
          </UCarousel>
        </div>
      </div>
    </div> -->

</template>

<script setup>

const projectsList = await queryContent("projects").find();


// const projectItems = ref([]);



// onMounted(async () => {
//   const response = await fetch("/data/events.json");
//   const data = await response.json();
//   projectItems.value = data.projects;

// });
</script>
