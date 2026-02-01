<template>
  <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Events</p>
      <h1 class="font-display text-3xl sm:text-4xl">Seminars & Meetings</h1>
      <p class="mt-3 max-w-2xl text-sm text-slate-600">
        Upcoming seminars, meetings, and training sessions.
      </p>
    </div>
  </section>
  <!-- Next Meeting Section -->
  <Titleheader
    v-if="nextseminar"
    class="mt-10"
    title="Next Meeting"
  ></Titleheader>

  <!-- Display the next event as a card (full width) -->
  <div
    v-if="nextseminar"
    class="w-full rounded-[22px] border border-white/70 bg-white/80 p-6 shadow-lg"
  >
    <div class="flex flex-col gap-6 md:flex-row">
      <div class="md:w-1/3">
        <img
          :src="nextseminar.image"
          alt="Event Image"
          class="w-full h-auto object-cover rounded-2xl"
        />
      </div>
      <div class="md:w-2/3">
        <h2 class="font-display text-2xl text-slate-900 mb-4">
          {{ nextseminar.title }}
        </h2>
        <p class="text-sm text-slate-600">
          {{ nextseminar.description }}
        </p>
        <p class="text-sm text-slate-600 mt-2">
          <strong>Date:</strong> {{ nextseminar.date }}
        </p>
        <p class="text-sm text-slate-600">
          <strong>Location:</strong> {{ nextseminar.location }}
        </p>
        <div class="py-4"></div>
        <nuxt-link
          :to="`events/` + nextseminar.title"
          class="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
          >See the programm</nuxt-link
        >
      </div>
    </div>
  </div>

  <!-- Seminars Section -->
  <div id="seminar" class="mt-10">
      <div class="flex flex-col gap-6">
        <div class="col" v-for="(seminar, index) in seminars" :key="index">
          <CardLR
            :leftright="index % 2 == 1"
            :title="seminar.title"
            :imageURL="seminar.image"
            :abstract="seminar.description"
            :date="seminar.date"
            :seeMore="{
              label: 'Read more',
              link: `/seminars/${seminar?.title}`,
            }"
          />
        </div>
      </div>
  </div>
</template>

<script setup>
const seminars = await queryCollection("events").order("date", "ASC").all();
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
