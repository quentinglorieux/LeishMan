<template>
  <div class="mx-auto pt-4">
    <Titleheader title="Publications" />
    <!-- Year Filter -->
    <!-- <div v-for="x in filteredPublications">
      <pre>{{ x }}</pre>
    </div> -->

    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="year in availableYears"
        :key="year"
        @click="filterByYear(year)"
        :class="[
          'py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wide',
          {
            'bg-slate-900 text-white': selectedYear === year,
            'bg-white text-slate-600 border border-slate-200': selectedYear !== year,
          },
        ]"
      >
        {{ year }}
      </button>
      <button
        @click="filterByYear('all')"
        class="py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wide border border-slate-200 text-slate-600"
        :class="[
          'py-2 px-4 rounded-full text-xs font-semibold uppercase tracking-wide',
          {
            'bg-slate-900 text-white': selectedYear === 'all',
            'bg-white text-slate-600': selectedYear !== 'all',
          },
        ]"
      >
        All
      </button>
    </div>

    <!-- Publications List -->

    <div v-if="groupedPublications.length === 0" class="rounded-[18px] border border-white/70 bg-white/80 p-6 text-center text-sm text-slate-500">
      No publications found for this filter.
    </div>

    <div
      class="space-y-6"
      v-for="[yr, works] in groupedPublications"
      :key="yr"
    >
      <div class="flex items-center justify-between">
        <h2 class="font-display text-2xl text-slate-900 mt-6">{{ yr }}</h2>
        <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ works.length }} items</span>
      </div>
      <ul class="space-y-4">
        <li
          v-for="(work, index) in works"
          :key="index"
          class="rounded-[18px] border border-white/70 bg-white/80 p-4 shadow-sm"
        >
          <div class="text-lg font-semibold text-slate-900">
            <a
              :href="'https://doi.org/' + work.DOI"
              target="_blank"
              class="hover:underline text-slate-900"
            >
              {{ work.title }}
            </a>
          </div>
          <div class="text-sm text-slate-600 mb-2">
            {{ work.authors }}
          </div>

          <div v-if="work.DOI" class="text-xs font-semibold uppercase tracking-wide text-blue-700">
            <a :href="'https://doi.org/' + work.DOI" target="_blank" class="">
              <span>{{ work.journal }}, </span>
              <span>
                <strong> {{ work.volume }} </strong> ({{ work.year }})</span
              >
            </a>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const publications = await queryCollection("publications").all();
const selectedYear = ref("all");
const availableYears = ref([]);
const filteredPublications = ref([]);
const groupedPublications = computed(() => {
  const groups = {};
  for (const pub of filteredPublications.value) {
    const year = pub.year || "Unknown";
    (groups[year] ||= []).push(pub);
  }
  return Object.entries(groups)
    .sort((a, b) => (a[0] === "Unknown" ? 1 : b[0] === "Unknown" ? -1 : Number(b[0]) - Number(a[0])));
});

onMounted(async () => {
  try {
    // Fetch the improved JSON file
    const years = publications
      .map((work) => work.year) // No need to extract year from date anymore
      .filter(Boolean);
    availableYears.value = [...new Set(years)].sort((a, b) => b - a);

    filterByYear("all");
  } catch (error) {
    console.error("Error fetching publications data:", error);
  }
});

async function filterByYear(yr) {
  selectedYear.value = yr;

  if (yr === "all") {
    filteredPublications.value = await queryCollection("publications").all();
  } else {
    filteredPublications.value = await queryCollection("publications")
      .where("year", "=", String(yr))
      .all();
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
