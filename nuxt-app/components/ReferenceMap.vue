<template>
    <GMapMap
      :center="{ lat: 48.8566, lng: 2.3522 }"  <!-- Centered in Europe -->
      :zoom="5"
      style="width: 100%; height: 400px;"
    >
      <GMapMarker
        v-for="(center, index) in referenceCenters"
        :key="index"
        :position="{ lat: center.lat, lng: center.lng }"
        :clickable="true"
        :draggable="false"
      />
    </GMapMap>
  </template>
  
  <script setup>  
  // State for reference centers
  const referenceCenters = ref([])
  
  onMounted(async () => {
    try {
      const response = await fetch('/data/reference-centers.json')
      const data = await response.json()
      referenceCenters.value = data.centers
    } catch (error) {
      console.error('Error fetching reference center data:', error)
    }
  })
  </script>
  