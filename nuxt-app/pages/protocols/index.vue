<template>
  <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Guides</p>
      <h1 class="font-display text-3xl sm:text-4xl">Protocols</h1>
      <p class="mt-3 max-w-2xl text-sm text-slate-600">
        Updated protocols and documentation from the network.
      </p>
    </div>
  </section>

  <div class="mt-10 space-y-6">
    <div class="flex flex-col gap-6">
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

const protocolsRaw = await queryCollection("protocols").all();

// Convert markdown description to HTML
const protocols = protocolsRaw.map((pr) => ({
  ...pr,
  htmlDescription: md.render(pr.shortdescription || ""),
}));
</script>
