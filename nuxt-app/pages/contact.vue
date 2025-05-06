<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Contact Us</h1>
    </div>
  </section>

  <div v-for="(m, index) in contact">
    <CardLR
      :leftright="index % 2 != 0"
      :title="m['firstname'] + ' ' + m['lastname']"
      :mail="m['mail']"
      :imageURL="m.thumbnail"
      :abstract="m['shortbio']"
    />
  </div>
</template>
<script setup>
const contact = await queryContent("members")
  .where({ coordinator: true })
  .find();
</script>
