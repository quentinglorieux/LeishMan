<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Seminars & Meetings</h1>
    </div>
  </section>
  <!-- Next Meeting Section -->
  <Titleheader
    v-if="nextseminar"
    class="p-10"
    title="Next Meeting"
  ></Titleheader>

  <!-- Display the next event as a card (full width) -->
  <div
    v-if="nextseminar"
    class="w-80 bg-white p-6 shadow-md rounded-lg mx-auto"
  >
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3">
        <img
          :src="nextseminar.image"
          alt="Event Image"
          class="w-full h-auto object-cover rounded-lg"
        />
      </div>
      <div class="md:w-2/3 md:pl-6 mt-4 md:mt-0">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {{ nextseminar.title }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300">
          {{ nextseminar.description }}
        </p>
        <p class="text-gray-600 dark:text-gray-300 mt-2">
          <strong>Date:</strong> {{ nextseminar.date }}
        </p>
        <p class="text-gray-600 dark:text-gray-300">
          <strong>Location:</strong> {{ nextseminar.location }}
        </p>
        <div class="px-6 py-4"></div>
        <nuxt-link
          :to="`events/` + nextseminar.title"
          class="bg-pasteur-blue text-white px-4 py-2 rounded hover:bg-pasteur-dark"
          >See the programm</nuxt-link
        >
      </div>
    </div>
  </div>

  <!-- Seminars Section -->
  <div id="seminar" class="p-10 bg-slate-200 text-gray-800 dark:bg-slate-400">
    <Titleheader title="Seminars"></Titleheader>
    <div class="flex flex-wrap sbt">
      <div class="col" v-for="(seminar, index) in seminars" :key="index">
        <CardL
          v-if="index % 2 == 1"
          :title="seminar.title"
          :location="seminar.location"
          :imageURL="seminar.image"
          :abstract="seminar.description"
          :date="seminar.date"
          :seeMore="{
            label: 'See the program',
            link: `/seminars/${seminar?.title}`,
          }"
        />
        <CardR
          v-else
          :title="seminar.title"
          :location="seminar.location"
          :imageURL="seminar.image"
          :abstract="seminar.description"
          :date="seminar.date"
          :seeMore="{
            label: 'See the program',
            link: `/seminars/${seminar?.title}`,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const seminars = await queryContent("events").sort({ date: 1 }).find();
const today = new Date();
const futurseminar = seminars.filter((event) => new Date(event.date) > today);
var nextseminar = false;
if (futurseminar.length > 0) {
  nextseminar = futurseminar[0];
}
</script>

<style scoped>
.w-80 {
  width: 80%;
}
.bg-white {
  background-color: white;
}
.p-6 {
  padding: 1.5rem;
}
.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.rounded-lg {
  border-radius: 0.75rem;
}
</style>
