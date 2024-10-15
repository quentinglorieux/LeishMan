<template>
  <div
    class="block m-4 px-2 py-4 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="flex">
      <h3 class="p-4 md:uppercase text-gray-800 font-bold text-xl dark:text-white">
        {{ title }}
      </h3>

      <div class="sm:w-5/6 p-4 text-gray-800 dark:text-white">
        {{ location }}
      </div>
    </div>
    <div class="sm:flex">
      <div class="align-baseline">
        <img :src="imageURL" class="fixed-size" />
      </div>
      <div class="md:w-5/6 p-4 text-gray-800 dark:text-white">
        {{ abstract }}
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
