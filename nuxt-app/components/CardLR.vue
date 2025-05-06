<template>
  <div class="w-screen">
    <div
      class="block w-11/12 m-4 px-2 py-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="flex flex-wrap items-center justify-between p-4">
        <h3
          class="text-gray-800 font-bold text-xl md:uppercase dark:text-white"
        >
          {{ title }}
        </h3>
        <div
          class="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-800 dark:text-white"
        >
          <div v-if="date" class="sm:mr-10 pt-5 sm:p-0">
            {{ date }}
          </div>
          <div v-if="location">
            {{ location }}
          </div>
        </div>
      </div>

      <div class="sm:flex">
        <div v-if="!leftright" class="align-baseline">
          <img :src="imageURL" class="fixed-size" />
        </div>

        <div v-if="html" class="md:w-5/6 p-4 text-gray-800 dark:text-white">
          <div
            class="prose dark:prose-invert mb-4 md:w-5/6 p-4 text-gray-800 dark:text-white"
            v-html="html"
          />

          <div>
            <NuxtLink
              v-if="seeMore?.link"
              :to="seeMore.link"
              class="inline-block bg-blue-400 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {{ seeMore.label }}
            </NuxtLink>
          </div>
        </div>

        <div v-if="abstract" class="md:w-5/6 p-4 text-gray-800 dark:text-white">
          {{ abstract }}
          <div>
            <NuxtLink
              v-if="seeMore?.link"
              :to="seeMore.link"
              class="inline-block bg-blue-400 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {{ seeMore.label }}
            </NuxtLink>
          </div>
        </div>
        <div v-if="externalLink" class="md:w-5/6 p-4 text-gray-800 dark:text-white">
          
            <NuxtLink
              v-if="externalLink?.link"
              :to="externalLink.link"
              class="inline-block bg-blue-400 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {{ externalLink.label }}
            </NuxtLink>
          
        </div>

        <div v-if="leftright" class="">
          <img :src="imageURL" class="fixed-size" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  location: String,
  imageURL: String,
  abstract: String,
  articleURL: String,
  date: String,
  seeMore: Object,
  externalLink:Object,
  html: String,
  leftright: Boolean,
});
</script>

<style scoped>
.fixed-size {
  width: 200px; /* Set a fixed width */
  height: 200px; /* Set a fixed height */
  object-fit: cover; /* This ensures the image covers the container */
  border-radius: 8px; /* Optional: for rounded corners */
}
</style>
