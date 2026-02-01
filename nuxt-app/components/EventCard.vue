<template>
  <article
    class="group rounded-[22px] border border-white/70 bg-white/80 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
    <div class="relative overflow-hidden rounded-t-[22px]">
      <img class="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        :src="eventItem.image || placeholderImage" :alt="eventItem.title" />
      <span class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
        {{ eventItem.date }}
      </span>
    </div>
    <div class="px-6 py-5">
      <h3 class="font-display text-xl text-slate-900">{{ eventItem.title }}</h3>
      <p class="mt-3 text-sm text-slate-600">
        {{ eventItem.description }}
      </p>
      <div class="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Location: {{ eventItem.location }}
      </div>
      <div class="mt-5">
        <nuxt-link :to="`seminars/` + eventItem.title"
          class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800">
          See the program
        </nuxt-link>
      </div>
    </div>
  </article>
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
