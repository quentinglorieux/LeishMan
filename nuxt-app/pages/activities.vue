<template>
  <div class="h-screen">
    <div id="seminar" class="p-10 bg-slate-200 text-gray-800 dark:bg-slate-400">
      <Titleheader title="Seminars"> </Titleheader>

      <p class="m-10"></p>
      <div class="flex flex-wrap sbt">
        <div class="col" v-for="(seminar, index) in seminarItems">
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
    <div id="project" class="py-10 bg-white text-gray-800 dark:bg-slate-500">
      <div>
        <Titleheader id="project" title="Projects"> </Titleheader>
        <div class="md:w-9/12 mx-auto">
          <UCarousel
            v-slot="{ item, index }"
            :items="projectItems"
            width="300"
            height="400"
            draggable="false"
            :ui="{ item: 'basis-full md:basis-1/2 lg:basis-1/3' }"
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
    </div>

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
  </div>
</template>

<script setup>
const eventItems = ref([]);
const seminarItems = ref([]);
const projectItems = ref([]);
const collabItems = ref([]);

onMounted(async () => {
  const response = await fetch("/data/events.json");
  const data = await response.json();
  eventItems.value = data.events;
  seminarItems.value = data.seminars;
  collabItems.value = data.collaborations;
  projectItems.value = data.projects;
});
</script>
