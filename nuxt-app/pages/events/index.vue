<template>
  <div>
    <Titleheader title="Events" />
    <div class="container mx-auto">
      <div class="container mx-auto px-10">
        <h2 v-if="future.length > 0" class="text-3xl font-bold mb-6">Upcoming Events</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          <EventCard v-for="event in future" :key="event.id" :eventItem="event" />
        </div>

        <h2 class="text-3xl font-bold mt-6 mb-6">Past Events</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          <EventCard v-for="event in past" :key="event.id" :eventItem="event" />
        </div>
        <div class="mt-8 text-center">
          <nuxt-link
            to="/events"
            class="bg-pasteur-blue text-white px-6 py-3 rounded hover:bg-pasteur-dark"
            >View All Events</nuxt-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const eventList = await queryContent("events").sort("date").find();

const future = Array();
const past = Array();
const today = new Date();
eventList.forEach((event) => {
  const [day, month, year] = event.date.split('/');
const formattedDate = new Date(+year, +month - 1, +day); 
 
  if (formattedDate > today) {
    future.push(event);
  } else {
    past.push(event);
  }
});
</script>
