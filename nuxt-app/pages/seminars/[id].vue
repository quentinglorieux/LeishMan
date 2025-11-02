<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold text-center mb-8">
      {{ seminars.date }}
    </h1>
    {{ seminars.description }}

    <div v-if="seminars.program_pdf" class="my-6 mx-auto text-center">
    Download Link: <a
      :href="seminars.program_pdf"
      class="mt-6 bg-pasteur-blue hover:bg-pasteur-dark text-white px-6 py-3 rounded-full"
    >
      Program in PDF
    </a>
    </div>
  </div>

  <ProgDisplay v-if="!seminars.program_pdf" :programData="seminars.talk" />
</template>

<script setup>
const route = useRoute();
const seminars = await queryContent("events")
  .where({ title: route.params.id })
  .findOne();
</script>
