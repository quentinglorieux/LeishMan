<template>
  <section v-if="futureseminars.length > 0" class="py-12">
    <div class="container mx-auto px-10">
      <h2 class="text-3xl font-bold mb-6">Upcoming Events</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        <EventCard
          v-for="event in futureseminars"
          :key="event.id"
          :eventItem="event"
        />
      </div>
      <!--<div class="mt-8 text-center">
        <nuxt-link
          to="/events"
          class="bg-pasteur-blue text-white px-6 py-3 rounded hover:bg-pasteur-dark"
          >View All Events</nuxt-link
        >
      </div> -->
    </div>
  </section>
</template>

<script setup>
const seminars = await queryContent("events").sort({ date: 1 }).find();
const today = new Date();
const nextseminar = seminars.filter(
  (event) => new Date(event.date) > today && Date(event.date) < today + 10
)[0];
const futureseminars = seminars.filter((event) => new Date(event.date) > today);

import { ref, onMounted } from "vue";
import EventCard from "@/components/EventCard.vue";

const eventItems = ref([]);
const fetchError = ref(null); // Error handling

onMounted(async () => {
  try {
    const eventsResponse = await fetch("/data/events.json");
    if (!eventsResponse.ok) {
      throw new Error("Failed to fetch events data.");
    }
    const eventsData = await eventsResponse.json();
    eventItems.value = eventsData.meetings.slice(0, 2); // Show the first 3 events
  } catch (error) {
    fetchError.value = error.message;
    console.error("Error fetching events data:", error);
  }
});
</script>
