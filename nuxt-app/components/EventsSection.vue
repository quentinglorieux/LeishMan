<template>
    <section class="py-12">
      <div class="container mx-auto px-10">
        <h2 class="text-3xl font-bold mb-6">Upcoming Events</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EventCard v-for="event in eventItems" :key="event.id" :eventItem="event" />
        </div>
        <div class="mt-8 text-center">
          <nuxt-link to="/events" class="bg-pasteur-blue text-white px-6 py-3 rounded hover:bg-pasteur-dark">View All Events</nuxt-link>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import EventCard from '@/components/EventCard.vue'
  
  const eventItems = ref([])
const fetchError = ref(null)  // Error handling

onMounted(async () => {
  try {
    const eventsResponse = await fetch('/data/events.json')
    if (!eventsResponse.ok) {
      throw new Error("Failed to fetch events data.")
    }
    const eventsData = await eventsResponse.json()
    eventItems.value = eventsData.events.slice(0, 3) // Show the first 3 events
  } catch (error) {
    fetchError.value = error.message
    console.error("Error fetching events data:", error)
  }
})
  </script>
  