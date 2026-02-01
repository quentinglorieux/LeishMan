<script setup>
const columns = [
  { accessorKey: "institution", header: "Institution Name" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "city", header: "City" },
];

const laboratories = await queryCollection("laboratories").all();
const filterLab = ref([]);

const q = ref("");
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
  <div class="rounded-[22px] border border-white/70 bg-white/80 shadow-lg">
    <div class="flex px-5 py-3.5 border-b border-slate-200">
      <UInput v-model="q" placeholder="Filter centers..." class="w-full" />
    </div>

  <UTable
      :data="filteredRows"
      :columns="columns"
      :loading-state="{
        icon: 'i-heroicons-arrow-path-20-solid',
        label: 'Loading...',
      }"
      class="text-slate-700"
    />
  </div>
</template>
