<template>
  <section class="py-12">
    <div class="container mx-auto px-10">
      <h2 v-if="future.length > 0" class="text-3xl font-bold mb-6">Upcoming Events</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        <EventCard v-for="event in future.slice(0, 2)" :key="event.id" :eventItem="event" />
      </div>

      <h2 class="text-3xl font-bold mt-6 mb-6">Past Events</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        <EventCard v-for="event in past.slice(0, 2)" :key="event.id" :eventItem="event" />
      </div>
      <div class="mt-8 text-center">
        <nuxt-link
          to="/events"
          class="bg-pasteur-blue text-white px-6 py-3 rounded hover:bg-pasteur-dark"
          >View All Events</nuxt-link
        >
      </div>
    </div>
  </section>
</template>

<script setup>
// import { ref, onMounted } from "vue";
// import EventCard from "@/components/EventCard.vue";

const eventList = await queryContent("events").sort({date:1}).find();

const future = Array();
const past = Array();

eventList.forEach((event) => {

  if (compareWithToday(event.date) > 0) {
    future.push(event);
  } else {
    past.push(event);
  }
});


function compareWithToday(dateString) {
    // Convert the input date (DD/MM/YYYY) into a Date object
    const [day, month, year] = dateString.split('/').map(Number);
    const inputDate = new Date(year, month - 1, day); // Month is zero-based

    // Get today's date without time (only year, month, and day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
        return -1; // The input date is before today
    } else if (inputDate > today) {
        return 1; // The input date is after today
    } else {
        return 0; // The input date is today
    }
}



</script>
