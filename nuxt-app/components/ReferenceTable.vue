<script setup>
import { ref, computed, onMounted } from 'vue';

// Define the columns based on the JSON structure
const columns = [
  { key: "institution", label: "Institution Name", sortable: true },
  { key: "country", label: "Country", sortable: true },
  { key: "city", label: "City", sortable: true },

];

const referenceCenters = ref([]);
const q = ref("");
const sort = ref({
  column: 'institution',
  direction: 'asc'
})


// Fetch reference centers data (update the file path to match your actual JSON file)
onMounted(async () => {
  try {
    const response = await fetch("/data/reference-centers-gps.json"); // Update the path
    const data = await response.json();
    
    // Remove duplicates based on 'institution', 'city', and 'country'
    const uniqueCenters = [];
    const uniqueKeys = new Set();
    
    data.forEach((center) => {
      const key = `${center.institution}-${center.city}-${center.country}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key);
        uniqueCenters.push(center);
      }
    });

    referenceCenters.value = uniqueCenters;  // Store unique values only
  } catch (error) {
    console.error("Error fetching reference center data:", error);
  }
});

// Filter the rows based on search input
const filteredRows = computed(() => {
  if (!q.value) {
    return referenceCenters.value;
  }

  return referenceCenters.value.filter((center) => {
    return Object.values(center).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<template>
  <div class="bg-white dark:bg-slate-700 dark:text-white mb-10">
    <div class="flex px-5 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter centers..." />
    </div>

    <UTable
      :rows="filteredRows"
      :columns="columns"
      :sort="sort"
      style="color: white"
      
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...'
      }"
      class="dark:text-white"
    />
  </div>
</template>
