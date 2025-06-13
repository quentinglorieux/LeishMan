<template>
  <div class="w-screen">
    <header class="bg-white shadow-md z-10 dark:bg-slate-600">
      <div class="container mx-auto flex justify-between items-center p-4">
        <nuxt-link to="/">
          <div class="flex items-center space-x-3">
            <h1
              class="text-2xl font-bold text-black tracking-wide dark:text-white"
            >
              LEISHMAN NETWORK
            </h1>
          </div>
        </nuxt-link>

        <!-- Main Navigation with vertical blue bars -->
        <nav
          class="hidden lg:flex space-x-4 text-gray-800 font-semibold uppercase"
        >
          <div
            v-for="(item, index) in menuItems"
            :key="item.name"
            class="flex items-center dark:text-white"
          >
            <!-- Vertical Bar -->
            <div
              v-if="index > 0"
              class="border-l-2 border-blue-600 h-6 mx-3"
            ></div>

            <!-- Menu Item with Submenu -->
            <div class="group relative">
              <nuxt-link :to="item.link" class="hover:text-blue-600">{{
                item.name
              }}</nuxt-link>

              <!-- Submenu -->
              <ul
                v-if="item.submenu"
                class="submenu absolute hidden group-hover:block shadow-lg bg-white dark:bg-slate-600 z-20"
              >
                <li v-for="sub in item.submenu" :key="sub.name">
                  <nuxt-link
                    :to="sub.link"
                    class="hover:text-blue-600 text-sm dark:text-white block p-2"
                  >
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

      <button
        class="lg:hidden block p-2 focus:outline-none"
        @click="toggleMenu"
      >
        <UIcon name="fa:bars" class="w-8 h-8 text-black dark:text-white">
        </UIcon>
      </button>

      <!-- Mobile Navigation -->
      <transition
        enter-class="opacity-0"
        enter-active-class="ease-out transition-medium"
        enter-to-class="opacity-100"
        leave-class="opacity-100"
        leave-active-class="ease-out transition-medium"
        leave-to-class="opacity-0"
      >
        <div
          @keydown.esc="isOpen = false"
          v-show="isOpen"
          class="z-10 fixed inset-0 transition-opacity"
        >
          <div
            @click="isOpen = false"
            class="absolute inset-0 bg-black opacity-50"
            tabindex="0"
          ></div>
        </div>
      </transition>
      <aside
        class="p-10 transform top-0 left-0 w-64 bg-gray-100 text-gray-600 dark:bg-slate-600 dark:text-gray-100 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="close">
          <button
            class="absolute top-0 right-0 mt-4 mr-4"
            @click="isOpen = false"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div
          class="border-b-2 border-blue-600 font-sans py-2"
          v-for="item in menuItems"
          :key="item.name"
        >
          <UIcon :name="item.icon" class="w-5 h-5 -translate-x-2" />

          <nuxt-link
            @click="isOpen = false"
            :to="item.link"
            class="divide-y-8 hover:text-blue-600 my-4 inline-block"
            >{{ item.name }}</nuxt-link
          >

          <!-- Render submenu in mobile view -->
          <div v-if="item.submenu" class="pl-4 space-y-2">
            <div v-for="sub in item.submenu" class="flex">
              <UIcon
                name="ic:outline-star"
                class="w-3 h-3 -translate-x-1 translate-y-1"
              />

              <nuxt-link
                @click="isOpen = false"
                :key="sub.name"
                :to="sub.link"
                class="hover:text-blue-600 block"
                >{{ sub.name }}</nuxt-link
              >
            </div>
          </div>
        </div>
      </aside>
    </header>
  </div>
</template>

<script setup>
import { ref } from "vue";

const menuItems = ref([]); // State to store the menu data
const isOpen = ref(false);
menuItems.value=[
    {
      "name": "The Network",
      "link": "",
      "icon": "zondicons:network",
      "submenu": [
        { "name": "About LeishMan", "link": "/about" },
        { "name": "Contact", "link": "/contact" },
        { "name": "Global Network", "link": "/reference-centers" },
        { "name": "Steering Committee", "link": "/steering" }

      ]
    },
    {
      "name": "What We Do ?",
      "icon": "grommet-icons:workshop",
      "link": "",
      "submenu": [
        // {"name" : "News", "link":"/news"},
        { "name": "Seminar/meeting", "link": "/seminars" },
        { "name": "Working group", "link": "/projects" },
        { "name": "Collaborations", "link": "/collaborations" },
        {"name": "Protocols", "link": "/protocols" },
      ]
    },
{
  "name": "Log-in",
  "icon": "i-heroicons-arrow-right-on-rectangle",
  "link": "/admin"
},
    {
      "name": "Publications",
      "icon": "i-heroicons-light-bulb",
      "link": "/publications"
    }
  ]


const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

// onMounted(async () => {
//   try {
//     // Fetch the menu data from the JSON file
//     const response = await fetch("/data/menu.json");
//     const data = await response.json();
//     menuItems.value = data.menuItems;
//   } catch (error) {
//     console.error("Error fetching menu data:", error);
//   }
// });
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
