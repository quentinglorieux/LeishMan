<template>
    <div class="reference-centers-page ">
      <h1 class="text-3xl font-bold mb-6 pt-10  ">Reference Centres</h1>
  
      <!-- Google Map  -->
      <ReferenceMap />
     
  
      <!-- Filterable and Searchable Table -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Participating Reference Centres</h2>
        <ReferenceTable />
      </div>
    </div>
  </template>
  

  
  <style scoped>
  .reference-centers-page {
    margin-left: 5%;
    margin-right: 5%;
  }
  </style>
  