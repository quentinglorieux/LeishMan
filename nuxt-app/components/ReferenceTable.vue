<template>
  <div>
    <!-- PrimeVue DataTable with global filter and alternate row styling -->
    <DataTable
      :value="referenceCenters"
      paginator
      :rows="10"
      :filters="filters"
      :responsiveLayout="'scroll'"
      :globalFilterFields="['name', 'country', 'city', 'representatives']"
      :class="{'p-datatable-striped': true, 'p-datatable-gridlines': true}"
    >
      <!-- Search bar for global search -->
      <template #header>
        <div class="table-header">
          <span class="text-lg font-semibold">Participating Reference Centres</span>
          <span class="p-input-icon-right">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Search" />
          </span>
        </div>
      </template>

      <!-- Columns -->
      <Column header="Center Name" field="name" filter sortable>
        <template #body="slotProps">
          <a :href="slotProps.data.link" target="_blank" class="text-blue-500 hover:underline">
            {{ slotProps.data.name }}
          </a>
        </template>
      </Column>
      <Column field="country" header="Country" filter sortable />
      <Column field="city" header="City" filter sortable />
      <Column field="mtgs" header="Speciality" />
      <Column field="representatives" header="Representative(s)" />
    </DataTable>
  </div>
</template>

<script setup>

// State for reference centers
const referenceCenters = ref([])

// Define global filter
const filters = ref({
  global: { value: null, matchMode: 'contains' }
})

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

<style scoped>
/* Styling for alternate rows and general table styling */
.p-datatable .p-datatable-tbody > tr:nth-child(even) {
  background-color: #f9f9f9;  /* Light gray alternate rows */
}

.p-datatable .p-datatable-tbody > tr:hover {
  background-color: #e6e6e6;  /* Darker gray on hover */
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.p-input-icon-right .pi-search {
  margin-right: 0.5rem;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
