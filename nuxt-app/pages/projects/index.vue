<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Projects</h1>
    </div>
  </section>

  <div class="md:p-10">
    <div class="flex flex-wrap sbt">
      <div v-for="(project, index) in projectsList" class="col">
        <CardLR
          :leftright="index % 2 == 1"
          :title="project.title"
          :imageURL="project.image"
          :html="project.htmlDescription"
          :date="project.date"
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

const projectsRaw = await queryContent("projects").find();

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
