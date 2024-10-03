<template>
  <div class="h-screen">
    <div id="seminar" class="p-10 bg-blue-100">
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
    <div id="project" class="py-10 bg-white">
      <div>
        <Titleheader id="project" title="Projects"> </Titleheader>
      </div>
    </div>
    <div id="collaborations" class="p-10 bg-blue-100">
      <Titleheader title="Collaborations"> </Titleheader>
    </div>
  </div>
</template>

<script setup>
const eventItems = ref([]);
const seminarItems = ref([]);

onMounted(async () => {
  const response = await fetch("/data/events.json");
  const data = await response.json();
  eventItems.value = data.events;
  seminarItems.value = data.seminars;
});
</script>
