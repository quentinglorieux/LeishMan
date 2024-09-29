<template>
    <div class="container mx-auto px-4">
      <h1 class="text-4xl font-bold my-4">Full List of Publications</h1>
  
      <!-- Year Filter -->
      <div class="flex flex-wrap space-x-2 mb-6">
        <button 
          v-for="year in availableYears" 
          :key="year" 
          @click="filterByYear(year)"
          :class="['py-2 px-4 rounded-full text-sm', { 'bg-gray-300 text-black': selectedYear === year, 'bg-gray-100 text-gray-600': selectedYear !== year }]"
        >
          {{ year }}
        </button>
        <button @click="filterByYear('all')" class="py-2 px-4 rounded-full bg-gray-100 text-gray-600 text-sm">All</button>
      </div>
  
      <!-- Publications List -->
      <div v-for="(works, year) in filteredPublications" :key="year">
        <h2 class="text-2xl font-semibold mt-6">{{ year }}</h2>
        <ul>
          <li v-for="work in works" :key="work.id" class="mb-4">
            <div class="text-xl font-semibold">
              <a :href="work.primary_location.landing_page_url" target="_blank" class="hover:underline text-black">
                {{ work.title }}
              </a>
            </div>
            <div class="text-gray-600 mb-2">
                <span v-for="author in work.authorships" :key="author.author.id" class="mr-2">
                {{ author.author.display_name }}
             <a :href="author.author.orcid" target="_blank" v-if="author.author.orcid" class="inline-block align-middle ml-1">
                <img src="https://orcid.org/sites/default/files/images/orcid_24x24.png" alt="ORCID Logo" class="w-3 h-3 align-text-top" style="position: relative; top: -0.5em; left: -0.4em;" />
                </a>
            </span>
            </div>


            <div class="text-blue-500">
              <a :href="work.primary_location.landing_page_url" target="_blank" class="hover:underline">
                {{ work.primary_location.source.display_name }}
              </a>
              <span> {{ work.primary_location.volume }} ({{ work.publication_year }})</span>
            </div>
            <div v-if="work.open_access.is_oa" class="text-sm text-blue-500">
              Open access:
              <a :href="work.open_access.oa_url" target="_blank" class="ml-2">
                <i class="pi pi-download"></i>
              </a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>  
  const publications = ref([])
  const selectedYear = ref('all')
  const availableYears = ref([])
  const filteredPublications = ref({})
  
  onMounted(async () => {
    try {
      const response = await fetch(
        'https://api.openalex.org/works?filter=authorships.author.id:A5017657842&select=title,open_access,authorships,primary_location,publication_year'
      )
      const data = await response.json()
      publications.value = data.results
  
      // Get available years from the data
      const years = publications.value.map(work => work.publication_year).filter(Boolean)
      availableYears.value = [...new Set(years)].sort((a, b) => b - a)
  
      filterByYear('all')
    } catch (error) {
      console.error('Error fetching publications:', error)
    }
  })
  
  function filterByYear(year) {
  selectedYear.value = year
  if (year === 'all') {
    filteredPublications.value = groupByYear(publications.value)
  } else {
    const filtered = publications.value.filter(work => work.publication_year === year)
    filteredPublications.value = groupByYear(filtered)
  }
}

function groupByYear(works) {
  const grouped = works.reduce((acc, work) => {
    const year = work.publication_year
    if (!acc[year]) acc[year] = []
    acc[year].push(work)
    return acc
  }, {})

  // Sort years and works in descending order
  return Object.keys(grouped)
    .sort((a, b) => b - a) // Sort years by most recent first
    .reduce((sortedAcc, year) => {
      sortedAcc[year] = grouped[year].sort((a, b) => b.publication_year - a.publication_year) // Sort publications by most recent first within each year
      return sortedAcc
    }, {})
}
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
  }
  </style>
  