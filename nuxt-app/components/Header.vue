<template>
  <header class="bg-pasteur-blue text-white py-4 fixed w-full top-0 z-50">
    <div class="container mx-auto flex justify-between items-center">
      <!-- Logo -->
      <nuxt-link to="/" class="text-2xl font-bold">
        <img src="/images/logo.png" alt="Pasteur Network Logo" class="h-10" />
      </nuxt-link>

      <!-- Mobile Hamburger Menu Button -->
      <button
        class="lg:hidden block"
        @click="menuOpen = !menuOpen"
      >
        <!-- Use a simple SVG for hamburger icon -->
        <svg
          class="h-6 w-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- Main Navigation -->
      <nav :class="menuOpen ? 'block' : 'hidden'" class="lg:flex space-x-6 w-full lg:w-auto lg:block">
        <ul class="lg:flex space-x-6">
          <!-- Render Menu Items Dynamically -->
          <li
            v-for="item in menuItems"
            :key="item.name"
            class="relative group"
            @mouseenter="menuHover(item)"
            @mouseleave="menuLeave(item)"
          >
            <a
              :href="item.link"
              class="hover:text-pasteur-light-blue"
            >
              {{ item.name }}
            </a>

            <!-- Submenu -->
            <ul
              v-if="item.submenu && item.isOpen"
              class="absolute left-0 mt-2 w-48 bg-white text-pasteur-blue shadow-lg"
            >
              <li
                v-for="sub in item.submenu"
                :key="sub.name"
                class="hover:bg-pasteur-light-blue"
              >
                <nuxt-link :to="sub.link" class="block px-4 py-2">{{ sub.name }}</nuxt-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// For controlling menu state
const menuOpen = ref(false)
const menuItems = ref([])

onMounted(async () => {
  const response = await fetch('/data/menu.json')
  const data = await response.json()
  menuItems.value = data.menuItems.map(item => ({
    ...item,
    isOpen: false // Initialize submenu open state
  }))
})

// Submenu hover behavior
const menuHover = (item) => {
  item.isOpen = true
}

const menuLeave = (item) => {
  item.isOpen = false
}
</script>

<style scoped>
/* Tailwind class to ensure submenu visibility */
.group:hover .group-hover\:block {
  display: block;
}

/* Style adjustments to ensure dropdown menus are responsive and fixed */
.fixed { position: fixed; }
.z-50 { z-index: 50; }
</style>
