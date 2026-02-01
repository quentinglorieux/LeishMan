<template>
  <section v-if="data && data.thumbnail" class="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-xl">
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${data.thumbnail})` }"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/70 to-transparent"></div>
    <div class="relative grid gap-10 px-8 py-14 sm:px-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-16">
      <div class="text-white">
        <p class="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Leishman Network
        </p>
        <h1 class="font-display text-4xl sm:text-5xl lg:text-6xl">
          {{ data.title }}
        </h1>
        <p class="mt-5 max-w-xl text-base sm:text-lg text-slate-100/90">
          {{ data.description }}
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <nuxt-link
            to="/about"
            class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Discover the network
          </nuxt-link>
          <nuxt-link
            to="/contact"
            class="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Contact coordinators
          </nuxt-link>
        </div>
      </div>
      <div class="grid gap-4">
        <div class="rounded-2xl border border-white/40 bg-white/10 p-5 text-white backdrop-blur">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-200">Mission</h3>
          <p class="mt-3 text-sm text-slate-100/90">
            Connect clinical and research teams across Europe to accelerate diagnostics, care, and collaboration.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-2xl border border-white/30 bg-white/10 p-5 text-white backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-slate-200">Working groups</p>
            <p class="mt-3 font-display text-3xl">6</p>
          </div>
          <div class="rounded-2xl border border-white/30 bg-white/10 p-5 text-white backdrop-blur">
            <p class="text-xs uppercase tracking-wide text-slate-200">Countries</p>
            <p class="mt-3 font-display text-3xl">20+</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const dataraw = await queryCollection("pages").all();
const data = dataraw[0];

</script>
