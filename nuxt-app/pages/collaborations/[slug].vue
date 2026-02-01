<template>
    <div class="space-y-6">
      <div class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span class="rounded-full border border-slate-200 bg-white px-3 py-1">{{ newsItem?.date }}</span>
        <span>Collaboration</span>
      </div>
      <h1 class="font-display text-3xl sm:text-4xl text-slate-900">{{ newsItem?.title }}</h1>
      <img :src="newsItem?.image" :alt="newsItem?.title" class="w-full h-72 rounded-[22px] object-cover shadow-lg" />
  
      <div class="prose max-w-none text-slate-700" v-html="renderedHtml" />
    </div>
  </template>
  
  
    <script setup>
  import MarkdownIt from 'markdown-it'
  const route = useRoute()
  
  const newsItem = await queryCollection("collaborations")
    .where("title", "=", route.params.slug)
    .first();
  const md = new MarkdownIt()
  
  const renderedHtml = md.render(newsItem?.description , "")
    </script>
  
  
