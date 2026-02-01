<template>
  <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Contact</p>
      <h1 class="font-display text-3xl sm:text-4xl">Contact Us</h1>
      <p class="mt-3 max-w-2xl text-sm text-slate-600">
        Reach the coordinating team for collaborations, membership, and network questions.
      </p>
    </div>
  </section>

  <div class="mt-10 grid gap-6 lg:grid-cols-2">
    <article
      v-for="(m, index) in contact"
      :key="index"
      class="flex h-full gap-5 rounded-[22px] border border-white/70 bg-white/80 p-6 shadow-lg"
    >
      <div class="flex-shrink-0">
        <img
          :src="m.thumbnail"
          :alt="m['firstname'] + ' ' + m['lastname']"
          class="h-24 w-24 rounded-2xl object-cover shadow-sm"
        />
      </div>
      <div class="flex flex-col">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <h2 class="font-display text-xl text-slate-900">
            {{ m['firstname'] + ' ' + m['lastname'] }}
          </h2>
          <a
            v-if="m['mail']"
            :href="'mailto:' + m['mail']"
            class="text-xs font-semibold uppercase tracking-wide text-blue-700 hover:text-blue-500"
          >
            Email
          </a>
        </div>
        <p class="mt-3 text-sm text-slate-600">
          {{ m['shortbio'] }}
        </p>
      </div>
    </article>
  </div>
</template>
<script setup>
const contact = await queryCollection("members")
  .where("coordinator", "=", true)
  .all();
</script>
