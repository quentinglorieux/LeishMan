<template>
  <div>
    <Titleheader title="Events" />
    <div class="container mx-auto">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EventCard
          v-for="event in eventItems"
          :key="event.id"
          :eventItem="event"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const eventItems = ref([]);

onMounted(async () => {
  const response = await fetch("/data/events.json");
  const data = await response.json();
  eventItems.value = data.events;
});
</script>
