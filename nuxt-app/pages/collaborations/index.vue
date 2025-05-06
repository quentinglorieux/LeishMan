<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Collaborations</h1>
    </div>
  </section>


  <div class="md:p-10">
    <div class="flex flex-wrap sbt">
      <div v-for="(collab, index) in collaborations" class="col">
        
        <CardLR
        :leftright="collab % 2 == 1"
        :title="collab.title"
        :imageURL="collab.image"
        :html="collab.htmlDescription"
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
const collaborationsRaw = await queryContent("collaborations").find();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});


// Convert markdown description to HTML
const collaborations = collaborationsRaw.map((pr) => ({
  ...pr,
  htmlDescription: md.render(pr.shortdescription || ""),
}));
</script>