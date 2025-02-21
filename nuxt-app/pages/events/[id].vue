<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold text-center mb-8">
      {{seminars.date}}  
    </h1>
   
  </div>
  <ProgDisplay :programData="seminars.talk" />
</template>

<script setup>
const route = useRoute();
const seminars = await queryContent("events").where({ title: route.params.id }).findOne();
</script>
