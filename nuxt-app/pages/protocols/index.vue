<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Protocols</h1>
    </div>
  </section>

  <div class="md:p-10">
    <div class="flex flex-wrap sbt ">
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

</template>

<script setup>
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const protocolsRaw = await queryContent("protocols").find();

// Convert markdown description to HTML
const protocols = protocolsRaw.map((pr) => ({
  ...pr,
  htmlDescription: md.render(pr.shortdescription || ""),
}));
</script>
