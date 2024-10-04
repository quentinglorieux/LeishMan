<template>
  <div class="max-w-sm rounded overflow-hidden shadow-lg dark:bg-slate-500">
    <img
      class="w-full h-48 object-cover"
      :src="newsItem.image || placeholderImage"
      :alt="newsItem.title"
    />
    <div class="px-6 py-4">
      <h3 class="font-bold text-xl mb-2">{{ newsItem.title }}</h3>
      <p class="text-gray-700 dark:text-white text-base">
        {{ newsItem.excerpt }}
      </p>
    </div>
    <div class="px-6 py-4 flex justify-between items-center">
      <span class="text-sm text-gray-600 dark:text-white">{{
        formattedDate
      }}</span>
      <nuxt-link
        :to="`/news/${newsItem.id}`"
        class="text-pasteur-blue hover:underline"
        >Read More</nuxt-link
      >
    </div>
  </div>
</template>

<script setup>
// Define the `newsItem` prop with `defineProps`
const props = defineProps({
  newsItem: {
    type: Object,
    required: true,
  },
});

// Placeholder image if the news item doesn't have an image
const placeholderImage = "/images/placeholder.png";

// Computed property to format the date
const formattedDate = computed(() => {
  return new Date(props.newsItem.date).toLocaleDateString();
});
</script>
