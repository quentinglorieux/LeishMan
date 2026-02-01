<template>
  <div>
    <article
      class="flex h-full flex-col rounded-[22px] border border-white/70 bg-white/80 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h3 class="font-display text-2xl text-slate-900">
          {{ title }}
        </h3>
        <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div v-if="date">{{ date }}</div>
          <div v-if="location">{{ location }}</div>
          <div v-if="mail">
            <a :href="'mailto:' + mail" class="text-blue-700 hover:text-blue-500">Email</a>
          </div>
        </div>
      </div>

      <div
        class="mt-6 grid gap-6"
        :class="imageURL
          ? (forceSideImage ? 'grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] lg:grid-cols-[220px_1fr]' : 'lg:grid-cols-[220px_1fr]')
          : 'lg:grid-cols-1'"
      >
        <!-- Image -->
        <div
          v-if="imageURL"
          class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
          :class="[
            leftright ? 'lg:order-2' : 'lg:order-1',
            imageSize === 'sm' ? 'lg:w-32' : imageSize === 'md' ? 'lg:w-44' : 'lg:w-56',
            imageShape === 'square' ? 'aspect-square' : ''
          ]"
        >
          <img
            :src="imageURL"
            class="w-full object-cover"
            :class="imageSize === 'sm' ? 'h-24 sm:h-28 lg:h-32' : imageSize === 'md' ? 'h-32 sm:h-36 lg:h-40' : imageShape === 'square' ? 'h-full' : 'h-40 sm:h-48 lg:h-full'"
          />
        </div>
        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs uppercase tracking-[0.2em] text-slate-400"
        >
          No image provided
        </div>

        <!-- Textual content -->
        <div class="flex h-full flex-col space-y-4">
          <div v-if="html" class="prose max-w-none text-slate-700" v-html="html" />
          <p v-if="abstract" class="text-sm text-slate-600">
            {{ abstract }}
          </p>

          <div class="mt-auto flex flex-wrap gap-3">
            <NuxtLink
              v-if="seeMore?.link"
              :to="seeMore.link"
              class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
            >
              {{ seeMore.label }}
            </NuxtLink>
            <NuxtLink
              v-if="externalLink?.link"
              :to="externalLink.link"
              class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            >
              {{ externalLink.label }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </article>
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
  externalLink: Object,
  html: String,
  leftright: Boolean,
  mail: String,
  imageSize: {
    type: String,
    default: "lg",
  },
  imageShape: {
    type: String,
    default: "rect",
  },
  forceSideImage: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped></style>
