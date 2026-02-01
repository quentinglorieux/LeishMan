<template>
  <article
    class="group rounded-[22px] border border-white/70 bg-white/80 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
    <div class="relative overflow-hidden rounded-t-[22px]">
      <img class="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        :src="newsItem.image || placeholderImage" :alt="newsItem.title" />
      <span class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
        {{ newsItem.date }}
      </span>
    </div>
    <div class="px-6 py-5">
      <h3 class="font-display text-xl text-slate-900">{{ newsItem.title }}</h3>
      <p class="mt-3 text-sm text-slate-600">
        {{ newsItem.excerpt || newsItem.shortdescription }}
      </p>
      <div class="mt-5 flex items-center justify-between">
        <nuxt-link :to="`/news/${newsItem.title}`"
          class="text-sm font-semibold text-blue-700 transition group-hover:text-blue-500">
          Read more →
        </nuxt-link>
      </div>
    </div>
  </article>
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
const placeholderImage = "placeholder.webp";

// Computed property to format the date

</script>
