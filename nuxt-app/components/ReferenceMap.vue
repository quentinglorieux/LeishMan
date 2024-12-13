<script setup>
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";

const laboratories = await queryContent("laboratories").find();
const filterLab = ref([]);
onMounted(async () => {
  try {
    laboratories.forEach((x) =>
      filterLab.value.push({
        country: x.country,
        city: x.city,
        info: x.title,
        lat: parseFloat(x.lat),
        lng: parseFloat(x.lng),
      })
    );
  } catch (error) {
    console.error("Error fetching reference center data:", error);
  }
});

// Default values for center and markerOptions
const center = ref({ lat: 48.866667, lng: 2.333 }); // Default center
const center0 = ref({ lat: 48.866667, lng: 22.333 }); // Default center
const markerOptions = ref({
  position: center.value,
  label: "L1",
  title: "Labo 1",
}); // Default markerOptions
const locations = ref([]); // Empty array, will be filled with data from JSON

const config = useRuntimeConfig();
const api_key = config.public.publicApiKey;
</script>

<template>
  <GoogleMap
    :api-key="api_key"
    style="width: 100%; height: 500px"
    :center="center0"
    :zoom="4"
  >
    <Marker
      v-for="(location, i) in filterLab"
      :key="i"
      :options="{ position: { lat: location['lat'], lng: location['lng'] } }"
      clickable="true"
    >
      <InfoWindow :options="{ position: location }">
        <div>
          <h3 class="font-bold text-md">{{ location["info"] }}</h3>
          <p>{{ location["city"] }}, {{ location["country"] }}</p>
        </div>
      </InfoWindow>
    </Marker>
  </GoogleMap>
</template>
