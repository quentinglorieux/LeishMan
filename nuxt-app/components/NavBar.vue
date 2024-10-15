<template>
  <div class="w-screen">
    <header class="bg-white shadow-md z-10 dark:bg-slate-600">
      <div class="container mx-auto flex justify-between items-center p-4">
        <nuxt-link to="/">
          <div class="flex items-center space-x-3">
            <h1 class="text-2xl font-bold text-black tracking-wide dark:text-white">
              LEISHMAN NETWORK
            </h1>
          </div>
        </nuxt-link>

        <!-- Main Navigation with vertical blue bars -->
        <nav class="hidden lg:flex space-x-4 text-gray-800 font-semibold uppercase">
          <div v-for="(item, index) in menuItems" :key="item.name" class="flex items-center dark:text-white">
            <!-- Vertical Bar -->
            <div v-if="index > 0" class="border-l-2 border-blue-600 h-6 mx-3"></div>

            <!-- Menu Item with Submenu -->
            <div class="group relative">
              <nuxt-link :to="item.link" class="hover:text-blue-600">{{ item.name }}</nuxt-link>

              <!-- Submenu -->
              <ul v-if="item.submenu" class="submenu absolute hidden group-hover:block shadow-lg bg-white dark:bg-slate-600 z-20">
                <li v-for="sub in item.submenu" :key="sub.name">
                  <nuxt-link :to="sub.link" class="hover:text-blue-600 text-sm dark:text-white block p-2">
                    {{ sub.name }}
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Mobile Menu Button and ColorMode Component -->
        <div class="flex items-center space-x-6">
          <div><ColorMode /></div>
        </div>
      </div>

      <!-- Blue Divider -->
      <div class="border-t-2 border-blue-600"></div>

      <!-- Mobile Menu and Aside omitted for brevity -->
    </header>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const menuItems = ref([]); // State to store the menu data
const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

onMounted(async () => {
  try {
    // Fetch the menu data from the JSON file
    const response = await fetch("/data/menu.json");
    const data = await response.json();
    menuItems.value = data.menuItems;
  } catch (error) {
    console.error("Error fetching menu data:", error);
  }
});
</script>

<style scoped>
/* Dropdown hover styling */
.group:hover .group-hover\:block {
  display: block;
}

/* Styling for submenu to make it larger than parent */
.submenu {
  min-width: 200px; /* Set a minimum width, can be adjusted */
  width: auto; /* Allow the submenu to expand based on content */
  padding: 8px; /* Add padding to make it spacious */
  padding-top: 20px;
}

.submenu li {
  white-space: nowrap; /* Prevent line breaks and keep items in one line */
}

.submenu ul {
  list-style: none; /* Remove bullet points */
  margin: 0;
  padding: 0;
}
</style>
