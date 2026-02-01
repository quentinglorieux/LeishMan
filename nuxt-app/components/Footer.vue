<template>
  <footer class="mt-12 border-t border-white/70 bg-white/70 py-10 backdrop-blur">
    <div class="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-sm">
        <h5 class="font-display text-xl text-slate-900">LeishMan Network</h5>
        <p class="mt-3 text-sm text-slate-600">
          A collaborative European network for clinical care, research, and coordination on leishmaniasis.
        </p>
      </div>
      <div>
        <h6 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</h6>
        <p class="mt-3 text-sm text-slate-700">contact@leishman-network.org</p>
        <p class="mt-1 text-xs text-slate-500">Institut Pasteur, Paris</p>
      </div>
      <div>
        <h6 class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Explore</h6>
        <div class="mt-3 flex flex-col gap-2 text-sm text-slate-700">
          <nuxt-link to="/news" class="transition hover:text-blue-600">News</nuxt-link>
          <nuxt-link to="/seminars" class="transition hover:text-blue-600">Seminars</nuxt-link>
          <nuxt-link to="/publications" class="transition hover:text-blue-600">Publications</nuxt-link>
        </div>
      </div>
    </div>
  </footer>
</template>
  
