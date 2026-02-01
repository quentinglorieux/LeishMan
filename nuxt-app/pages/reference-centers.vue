<template>
  <div class="space-y-10">
    <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Network map</p>
        <h1 class="font-display text-3xl sm:text-4xl">Reference Centres</h1>
        <p class="mt-3 max-w-2xl text-sm text-slate-600">
          Explore participating reference centres across the network.
        </p>
      </div>
    </section>

    <ReferenceMap />

    <div class="mt-8">
      <h2 class="font-display text-2xl text-slate-900 mb-4 text-center">
        Participating Reference Centres
      </h2>
      <ReferenceTable />
    </div>
  </div>
</template>
<script setup></script>
<style scoped></style>
