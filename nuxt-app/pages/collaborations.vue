<template>
  <section class="bg-pasteur-blue text-white py-16">
<div class="container mx-auto text-center">
  <h1 class="text-4xl font-bold">Collaborations</h1>

</div>
</section>


<div
      id="collaborations"
      class="p-10 bg-slate-200 text-gray-800 dark:bg-slate-400"
    >
      <Titleheader title="Collaborations"></Titleheader>
      <div class="md:w-9/12 mx-auto">
        <UCarousel
          v-slot="{ item, index }"
          :items="collabItems"
          :ui="{ item: 'basis-full' }"
          class="overflow-hidden p-10"
          indicators
        >
          <div class="text-center mx-auto">
            <div class="mt-1 mb-5">
              <h2 class="text-xl text-center font-bold">{{ item.title }}</h2>
            </div>
            <img
              :src="item.image"
              :alt="item.description"
              class="h-72 md:h-96 mx-auto"
              draggable="false"
              arrows
            />
          </div>
        </UCarousel>
      </div>
    </div>

</template>

<script setup>
const collabItems = ref([]);



onMounted(async () => {
const response = await fetch("/data/events.json");
const data = await response.json();
collabItems.value = data.collaborations;
});
</script>
