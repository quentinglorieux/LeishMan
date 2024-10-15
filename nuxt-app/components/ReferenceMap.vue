<script setup lang="ts">
import { ref, onMounted } from "vue";
import { applyPlugin } from "#app";
import { GoogleMap, Marker, InfoWindow, MarkerCluster } from "vue3-google-map";

// Default values for center and markerOptions
const center = ref({ lat: 48.866667, lng: 2.333 }); // Default center
const center0 = ref({ lat: 48.866667, lng: 22.333 }); // Default center
const markerOptions = ref({ position: center.value, label: "L1", title: "Labo 1" }); // Default markerOptions
const isOpen = ref(false);
const locations = ref([]); // Empty array, will be filled with data from JSON

const config = useRuntimeConfig();
const api_key = config.public.publicApiKey;

// Fetch the location data from the JSON file
onMounted(async () => {
  try {
    const response = await fetch("/data/reference-centers-gps.json"); // Adjust the path if needed
    const data = await response.json();
    
    // Populate locations with the fetched data
    locations.value = data.map(center => ({
      lat: parseFloat(center.lat),
      lng: parseFloat(center.lng),
      info: center.institution,
      city: center.city,
      country: center.country
    }));

    // Optionally, update the center based on the first location
    if (locations.value.length > 0) {
      center.value = { lat: locations.value[0].lat, lng: locations.value[0].lng };
      markerOptions.value = { position: center.value, label: "L1", title: locations.value[0].info };
    }
  } catch (error) {
    console.error("Error fetching location data:", error);
  }
});
</script>

<template>
  <GoogleMap
    :api-key="api_key"
    style="width: 100%; height: 500px"
    :center="center0"
    :zoom="4"
  >
    <Marker
      v-for="(location, i) in locations"
      :key="i"
      :options="{ position: { lat: location['lat'], lng: location['lng'] } }"
      clickable="true"
    >
      <InfoWindow :options="{ position: location }">
        <div>
          <h3 class="font-bold text-md">{{ location['info'] }}</h3>
          <p>{{ location['city'] }}, {{ location['country'] }}</p>
        </div>
         <!--<InfoLabo
          :labo="location['info']"
          :lat="location['lat']"
          :lng="location['lng']"
        >
        </InfoLabo>-->
      </InfoWindow>
    </Marker>

    <!-- </MarkerCluster> -->
  </GoogleMap>
</template>
