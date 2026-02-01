<template>
  <div class="py-6 space-y-6">
    <div class="text-center">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Seminar</p>
      <h1 class="font-display text-3xl sm:text-4xl text-slate-900 mt-2">
        {{ seminars.date }}
      </h1>
      <p class="mt-3 text-sm text-slate-600">
        {{ seminars.description }}
      </p>
    </div>
    

  <div v-if="seminars.program_pdf" class="text-center">
    <a
      :href="seminars.program_pdf"
      class="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
    >
      Program in PDF
    </a>
  </div>
  </div>

  <ProgDisplay :programData="seminars.talk" />
</template>

<script setup>
const route = useRoute();
const seminars = await queryCollection("events")
  .where("title", "=", route.params.id)
  .first();
</script>
