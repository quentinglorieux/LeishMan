<script setup lang="ts">
const columns = [
  {
    key: "name",
    label: "Center Name",
    sortable: true,
  },
  {
    key: "country",
    label: "Country",
    sortable: true,
  },
  {
    key: "city",
    label: "City",
    sortable: true,
  },
  {
    key: "mtgs",
    label: "Speciality",
  },
  { key: "representatives", label: "Representative(s)" },
];

const referenceCenters = ref([]);

const q = ref("");

onMounted(async () => {
  try {
    const response = await fetch("/data/reference-centers.json");
    const data = await response.json();
    referenceCenters.value = data.centers;
  } catch (error) {
    console.error("Error fetching reference center data:", error);
  }
});

const filteredRows = computed(() => {
  if (!q.value) {
    return referenceCenters.value;
  }

  return referenceCenters.value.filter((lab) => {
    return Object.values(lab).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<template>
  <div class="bg-white dark:bg-slate-700 dark:text-white mb-10">
    <div class="flex px-3 py-3.5 border-b border-gray-200 dark:border-gray-700">
      <UInput v-model="q" placeholder="Filter people..." />
    </div>

    <UTable
      style="color: white"
      loading
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...',
      }"
      class="dark:text-white"
      :rows="filteredRows"
      :columns="columns"
    />
  </div>
</template>
