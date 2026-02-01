<template>
  <div class="w-full">
    <Hero />
    <section class="mt-10 rounded-[22px] border border-white/70 bg-white/80 p-8 shadow-lg text-left">
      <h2 class="font-display text-3xl text-slate-900">LeishMan Network</h2>
      <p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
        {{ networkDescription }}
      </p>
    </section>

    <WorkingGroupsSection />

    <NewsSection />
    <EventsSection />
  </div>
</template>

<script setup>
import { parse } from "yaml";
import Hero from "~/components/Hero.vue";

const { data: about } = await useAsyncData("about-home", async () => {
  const raw = await $fetch("/data/pages/about.yml");
  return parse(raw);
});

const networkDescription = computed(() => {
  return about.value?.description1 || 'The LeishMan Network connects a global community of researchers dedicated to promoting scientific excellence and fostering innovation to improve public health worldwide.';
});
</script>
