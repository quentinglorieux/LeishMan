<script setup>
const columns = [
  { key: "institution", label: "Institution Name", sortable: true },
  { key: "country", label: "Country", sortable: true },
  { key: "city", label: "City", sortable: true },
];

const laboratories = await queryContent("laboratories").find();
const filterLab = ref([]);

const q = ref("");
const sort = ref({
  column: "institution",
  direction: "asc",
});

onMounted(async () => {
  try {
    laboratories.forEach((x) =>
      filterLab.value.push({
        country: x.country,
        city: x.city,
        institution: x.title,
      })
    );
  } catch (error) {
    console.error("Error fetching reference center data:", error);
  }
});
const filteredRows = computed(() => {
  if (!q.value) {
    return filterLab.value;
  }

  return filterLab.value.filter((center) => {
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
        label: 'Loading...',
      }"
      class="dark:text-white"
    />
  </div>
</template>
