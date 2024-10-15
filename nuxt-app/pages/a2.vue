<template>
  <div class="h-screen">
    <div id="seminar" class="p-10 bg-slate-200 text-gray-800 dark:bg-slate-400">
      <Titleheader title="Seminars"> </Titleheader>

      <p class="m-10"></p>
      <div class="flex flex-wrap sbt">
        <div class="col" v-for="(seminar, index) in seminarItems" :key="index">
          <CardL
            v-if="index % 2 == 1"
            :title="seminar.title"
            :location="seminar.location"
            :imageURL="seminar.image"
            :abstract="seminar.description"
          />
          <CardR
            v-else
            :title="seminar.title"
            :location="seminar.location"
            :imageURL="seminar.image"
            :abstract="seminar.description"
          />
        </div>
      </div>
    </div>
    
    </div>
</template>

<script setup>


const seminarItems = ref([]);
const projectItems = ref([]);

onMounted(async () => {
  // Fetch seminar items from content folder using Nuxt Content
  // const { data }  = await useAsyncData('seminar', () => queryContent('/events').find())
  const seminars = await queryContent('/events').find();

  seminarItems.value = seminars;

  // You can also fetch other items if you add content for them in the future
});


</script>

<style scoped>
/* Add any specific styling you need here */
</style>