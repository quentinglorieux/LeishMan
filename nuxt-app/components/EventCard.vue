<template>
  <div class="max-w-sm rounded overflow-hidden shadow-lg dark:text-white">
    <img
      class="w-full h-48 object-cover"
      :src="eventItem.image || placeholderImage"
      :alt="eventItem.title"
    />
    <div class="px-6 py-4">
      <h3 class="font-bold text-xl mb-2">{{ eventItem.title }}</h3>
      <p> {{eventItem.date}}</p>
      <p class="text-gray-700 dark:text-white text-base">
        {{ eventItem.description }}
      </p>
      
    </div>
    <div class="px-6 py-4">
      <span class="block text-sm text-gray-600 dark:text-white"
        >Location: {{ eventItem.location }}</span
      >
    </div>
    <div class="px-6 py-4">

      <nuxt-link
        :to="`events/`+eventItem.title"
        class="bg-pasteur-blue text-white px-4 py-2 rounded hover:bg-pasteur-dark"
        >Learn More</nuxt-link
      >
    </div>
  </div>
</template>

<script setup>
defineProps({
  eventItem: {
    type: Object,
    required: true,
  },
});



const placeholderImage = "placeholder.webp";
</script>
