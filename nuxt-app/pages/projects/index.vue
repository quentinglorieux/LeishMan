<template>
  <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Working groups</p>
      <h1 class="font-display text-3xl sm:text-4xl">Working Groups</h1>
      <p class="mt-3 max-w-2xl text-sm text-slate-600">
        Explore the network's working groups and their focus areas.
      </p>
    </div>
  </section>

  <div class="mt-10">
    <div class="grid gap-6 lg:grid-cols-2 lg:auto-rows-fr">
      <div v-for="(project, index) in projectsList" class="col h-full">
        <CardLR
          :leftright="index % 2 == 1"
          :title="project.title"
          :imageURL="project.image"
          :html="project.htmlDescription"
          :date="project.date"
          imageShape="square"
          :seeMore="{
            label: 'Read more',
            link: `/projects/${project?.title}`,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import MarkdownIt from "markdown-it";

const projectsRaw = await queryCollection("projects").all();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Convert markdown description to HTML
const projectsList = projectsRaw.map((pr) => ({
  ...pr,
  htmlDescription: md.render(pr.shortdescription || ""),
}));
</script>
