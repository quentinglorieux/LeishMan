<template>
  <header class="bg-white shadow-md relative z-10">
    <!-- Logo and Navigation -->
    <div class="container mx-auto flex justify-between items-center py-4">
      <!-- Logo -->
      <nuxt-link to="/">
        <div class="flex items-center space-x-3">
          <img src="/images/logo.png" alt="LeishMan Network" class="h-10" />
          <h1 class="text-2xl font-bold text-black tracking-wide">
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
          class="flex items-center"
        >
          <!-- Add a vertical bar except for the first menu item -->
          <div
            v-if="index > 0"
            class="border-l-2 border-blue-600 h-6 mx-3"
          ></div>

          <!-- Render the menu item -->
          <div class="group relative">
            <nuxt-link :to="item.link" class="hover:text-blue-600">{{
              item.name
            }}</nuxt-link>

            <!-- Render submenu if it exists -->
            <ul
              v-if="item.submenu"
              class="absolute hidden group-hover:block bg-white shadow-lg mt-2 p-2 space-y-2 text-gray-700 z-20"
            >
              <li v-for="sub in item.submenu" :key="sub.name">
                <nuxt-link :to="sub.link" class="hover:text-blue-600 text-sm">{{
                  sub.name
                }}</nuxt-link>
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
          <button class="absolute right-3 top-2 text-blue-600"></button>
        </div>
      </div>
    </div>

    <!-- Blue Divider -->
    <div class="border-t-2 border-blue-600"></div>

    <!-- Mobile Menu Button -->
    <button class="lg:hidden block p-4 focus:outline-none" @click="toggleMenu">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16m-7 6h7"
        />
      </svg>
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
      class="dark:bg-gray-800 p-10 transform top-0 left-0 w-64 bg-slate-200 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30"
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

      <!-- <Tailwind /> -->

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
/* Styling for the vertical bars */
.border-l-2 {
  height: 24px; /* Adjust height to match the size of the menu */
}

.uppercase {
  letter-spacing: 0.05em; /* Slight tracking for all caps look */
}

/* Dropdown hover styling */
.group:hover .group-hover\:block {
  display: block;
}
</style>
