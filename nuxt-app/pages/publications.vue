<template>
  <div class="mx-auto px-4 pt-10 dark:bg-slate-800">
    <Titleheader title="  Publications" />
    <!-- Year Filter -->
    <!-- <div v-for="x in filteredPublications">
      <pre>{{ x }}</pre>
    </div> -->

    <div class="flex flex-wrap space-x-2 mb-6">
      <button
        v-for="year in availableYears"
        :key="year"
        @click="filterByYear(year)"
        :class="[
          'py-2 px-4 rounded-full text-sm',
          {
            'bg-gray-300 text-black': selectedYear === year,
            'bg-gray-100 text-gray-600 ': selectedYear !== year,
          },
        ]"
      >
        {{ year }}
      </button>
      <button
        @click="filterByYear('all')"
        class="py-2 px-4 rounded-full bg-gray-100 text-gray-600 text-sm dark:text-gray-600"
        :class="[
          'py-2 px-4 rounded-full text-sm',
          {
            'bg-gray-300 text-black': printedYears.length > 1,
            'bg-gray-100 text-gray-600 ': printedYears.length == 1,
          },
        ]"
      >
        All
      </button>
    </div>

    <!-- Publications List -->

    <div
      class="dark:bg-slate-800 dark:text-gray-300"
      v-for="yr in printedYears"
      :key="yr"
    >
      <h2 class="text-2xl font-semibold mt-6">{{ yr }}</h2>
      <ul>
        <li
          v-for="(work, index) in filteredPublications"
          :key="index"
          class="mb-4"
        >
          <div v-if="work.year == yr">
            <div class="text-xl font-semibold">
              <a
                :href="'https://pubmed.ncbi.nlm.nih.gov/' + work.pmid"
                target="_blank"
                class="hover:underline text-black dark:text-gray-300"
              >
                {{ work.title }}
              </a>
            </div>
            <div class="text-gray-600 mb-2 dark:text-gray-300">
              {{ work.authors }}
              <!-- <span
                v-for="(author, index) in work.authorslist"
                :key="author"
                class="mr-2"
              >
                {{ author.author
                }}<span v-if="index < work.authorslist.length - 1">,</span>
              </span> -->
            </div>

            <div v-if="work.DOI" class="text-sm text-blue-500">
              <a :href="'https://doi.org/' + work.doi" target="_blank" class="">
                <span>{{ work.journal }}, </span>
                <span>
                  <strong> {{ work.volume }} </strong> ({{ work.year }})</span
                >
              </a>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const publications = await queryContent("publications").find();
const selectedYear = ref("all");
const availableYears = ref([]);
const printedYears = ref([]);
const filteredPublications = ref({});

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
    printedYears.value = availableYears.value;
    filteredPublications.value = await queryContent("publications")
      .find();
  } else {
    printedYears.value = [yr];
    filteredPublications.value = await queryContent("publications")
      .where({ year : parseInt(yr) })
      .find();
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
