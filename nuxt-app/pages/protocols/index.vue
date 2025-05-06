<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Protocols</h1>
    </div>
  </section>

  <div class="p-10">
    <div class="flex flex-wrap sbt">
      <div v-for="(protocol, index) in protocols" class="col">
        <CardLR
          :leftright="index % 2 == 1"
          :title="protocol.title"
          :imageURL="protocol.image"
          :html="protocol.htmlDescription"
          :seeMore="{
            label: 'Read more',
            link: `/protocols/${protocol?.title}`,
          }"
        />
      </div>
    </div>
  </div>

  <!-- <div class="flex flex-wrap justify-around mx-auto">
    <div v-for="pr in protocols" :key="pr._path" class="shadow-lg rounded p-4">
      <h2 class="text-xl font-semibold mb-2">{{ pr.title }}</h2>

      <div class="prose dark:prose-invert mb-4" v-html="pr.htmlDescription" />

      <img
        v-if="pr.image"
        :src="pr.image"
        :alt="pr.title"
        class="w-full h-64 object-cover mb-4 rounded"
      />
    </div>
  </div> -->
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
