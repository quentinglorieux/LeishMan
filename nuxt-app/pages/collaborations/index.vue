<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Collaborations</h1>
    </div>
  </section>


  <div class="p-10">
    <div class="flex flex-wrap sbt">
      <div v-for="(collab, index) in collaborations" class="col">
        
        <CardLR
        :leftright="collab % 2 == 1"
        :title="collab.title"
        :imageURL="collab.image"
        :externalLink="{
          label: 'Go to the website',
          link: `${collab?.lien}`,
        }"
      />
      </div>
    </div>
  </div>


</template>

<script setup>
const collaborations = await queryContent("collaborations").find();
</script>