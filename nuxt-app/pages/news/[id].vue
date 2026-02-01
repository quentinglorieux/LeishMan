<template>
  <div class="space-y-8">
    <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <span class="rounded-full border border-slate-200 bg-white px-3 py-1">{{ newsItem?.date }}</span>
      <span>News</span>
      <NuxtLink to="/news" class="ml-auto text-xs font-semibold uppercase tracking-wide text-blue-700 hover:text-blue-500">
        Back to news
      </NuxtLink>
    </div>
    <h1 class="font-display text-3xl sm:text-4xl text-slate-900">{{ newsItem?.title }}</h1>
    <img :src="newsItem?.image" :alt="newsItem?.title" class="w-full h-72 rounded-[22px] object-cover shadow-lg" />

    <div class="mx-auto max-w-3xl">
      <div class="prose prose-slate max-w-none text-slate-700 leading-relaxed" v-html="renderedHtml" />
    </div>
  </div>
</template>


  <script setup>
import MarkdownIt from 'markdown-it'
const route = useRoute()

const newsItem = await queryCollection("news")
  .where("title", "=", route.params.id)
  .first();
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const renderedHtml = md.render(newsItem?.longdescription , "")
  </script>
