<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Contact Us</h1>
    </div>
  </section>

  <div v-for="(m, index) in contact">
    <CardL
      v-if="index % 2 == 0"
      :title="m['firstname'] + ' ' + m['lastname']"
      :location="m['mail']"
      :imageURL="m['thumbmail']"
      :abstract="m['shortbio']"
    />

    <CardR
      v-else
      :title="m['firstname'] + ' ' + m['lastname']"
      :location="m['mail']"
      :imageURL="m['thumbmail']"
      :abstract="m['shortbio']"
    />
  </div>
</template>
<script setup>
const contact = await queryContent("members")
  .where({ coordinator: true })
  .find();
</script>
