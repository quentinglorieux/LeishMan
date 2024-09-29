<template>
  <header class="bg-white shadow-md relative z-10">
    <!-- Logo and Navigation -->
    <div class="container mx-auto flex justify-between items-center py-4">

      <!-- Logo -->
      <nuxt-link to="/">
        <div class="flex items-center space-x-3">
        <img src="/images/logo.png" alt="LeishMan Network" class="h-10">
        <h1 class="text-2xl font-bold text-black tracking-wide">LEISHMAN NETWORK</h1>
        
      </div>
    </nuxt-link>

       <!-- Main Navigation with vertical blue bars -->
       <nav class="hidden lg:flex space-x-4 text-gray-800 font-semibold uppercase">
        <div v-for="(item, index) in menuItems" :key="item.name" class="flex items-center">
          <!-- Add a vertical bar except for the first menu item -->
          <div v-if="index > 0" class="border-l-2 border-blue-600 h-6 mx-3"></div>

          <!-- Render the menu item -->
          <div class="group relative">
            <nuxt-link :to="item.link" class="hover:text-blue-600">{{ item.name }}</nuxt-link>

            <!-- Render submenu if it exists -->
            <ul v-if="item.submenu" class="absolute hidden group-hover:block bg-white shadow-lg mt-2 p-2 space-y-2 text-gray-700 z-20">
              <li v-for="sub in item.submenu" :key="sub.name">
                <nuxt-link :to="sub.link" class="hover:text-blue-600 text-sm">{{ sub.name }}</nuxt-link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Language and Search -->
      <div class="flex items-center space-x-6">
        <!-- Language Switch 
        <div class="text-blue-600">
          <a href="#" class="hover:underline">EN</a> | <a href="#" class="hover:underline">FR</a>
        </div>
        -->

        <!-- Search Bar -->
        <div class="relative">
          <input
            type="text"
            placeholder="Search"
            class="bg-gray-100 border border-gray-300 rounded-full py-2 px-2 xl:px-10 text-sm focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button class="absolute right-3 top-2 text-blue-600">
            
          </button>
        </div>
      </div>
    </div>

    <!-- Blue Divider -->
    <div class="border-t-2 border-blue-600"></div>

    <!-- Mobile Menu Button -->
    <button class="lg:hidden block p-4 focus:outline-none" @click="toggleMenu">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    </button>

    <!-- Mobile Navigation -->
    <nav v-if="menuOpen" class="lg:hidden flex flex-col space-y-4 p-4 bg-white shadow-lg">
      <div v-for="item in menuItems" :key="item.name">
        <nuxt-link :to="item.link" class="hover:text-blue-600">{{ item.name }}</nuxt-link>

        <!-- Render submenu in mobile view -->
        <div v-if="item.submenu" class="pl-4 space-y-2">
          <nuxt-link v-for="sub in item.submenu" :key="sub.name" :to="sub.link" class="hover:text-blue-600 block">{{ sub.name }}</nuxt-link>
        </div>
      </div>
    </nav>

  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const menuItems = ref([])  // State to store the menu data
const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

onMounted(async () => {
  try {
    // Fetch the menu data from the JSON file
    const response = await fetch('/data/menu.json')
    const data = await response.json()
    menuItems.value = data.menuItems
  } catch (error) {
    console.error('Error fetching menu data:', error)
  }
})
</script>

<style scoped>
/* Styling for the vertical bars */
.border-l-2 {
  height: 24px;  /* Adjust height to match the size of the menu */
}

.uppercase {
  letter-spacing: 0.05em; /* Slight tracking for all caps look */
}

/* Dropdown hover styling */
.group:hover .group-hover\:block {
  display: block;
}
</style>
