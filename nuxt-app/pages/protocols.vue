<template>
  <Titleheader title="Protocols" />
  <div
    class="flex flex-wrap justify-around mx-auto "
  >
    <div
      v-for="pr in protocols"
      :key="pr._path"
      class="shadow-lg rounded p-4"
    >
      <h2 class="text-xl font-semibold mb-2">{{ pr.title }}</h2>

      <div class="prose dark:prose-invert mb-4" v-html="pr.htmlDescription" />

      <img
        v-if="pr.image"
        :src="pr.image"
        :alt="pr.title"
        class="w-full h-64 object-cover mb-4 rounded"
      />
    </div>
  </div>
</template>

<script setup>
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const protocolsRaw = await queryContent("protocols").find();

// Convert markdown description to HTML
const protocols = protocolsRaw.map((pr) => ({
  ...pr,
  htmlDescription: md.render(pr.description || ""),
}));
</script>
