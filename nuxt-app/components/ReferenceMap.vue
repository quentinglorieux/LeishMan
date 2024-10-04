<script setup lang="ts">
import { applyPlugin } from "#app";
import {
  GoogleMap,
  Marker,
  CustomMarker,
  InfoWindow,
  MarkerCluster,
} from "vue3-google-map";
const config = useRuntimeConfig();
const apikey = config.ggAPIkey;

const center = { lat: 48.866667, lng: 2.333 };
// const center = { lat: 52.36834, lng: 4.88635 };
const markerOptions = { position: center, label: "L1", title: "Labo 1" };
const isOpen = ref(false);
const locations = [
  { lat: 48.866667, lng: 2.333, info: "Labo 1" },
  { lat: 48.866667, lng: 2.534, info: "Labo 2" },
  { lat: 48.866667, lng: 2.735, info: "Labo 3" },
  { lat: 49.866667, lng: 5.333, info: "Labo 4" },
  { lat: 42.866667, lng: 1.333, info: "Labo 5" },
  { lat: 41.866667, lng: -1.333, info: "Labo 6" },
  { lat: 43.866667, lng: 5.333, info: "Labo 7" },
  { lat: 40.866667, lng: 2.233, info: "Labo 8" },
];
</script>
<template>
  <div>{{ apikey }}</div>
  <GoogleMap
    :api-key="apikey"
    style="width: 100%; height: 500px"
    :center="center"
    :zoom="5"
  >
    <Marker
      v-for="(location, i) in locations"
      :key="i"
      :options="{ position: { lat: location['lat'], lng: location['lng'] } }"
      clickable="true"
    >
      <InfoWindow :options="{ position: location }">
        <InfoLabo
          :labo="location['info']"
          :lat="location['lat']"
          :lng="location['lng']"
        >
        </InfoLabo>
      </InfoWindow>
    </Marker>

    <!-- </MarkerCluster> -->
  </GoogleMap>
</template>
