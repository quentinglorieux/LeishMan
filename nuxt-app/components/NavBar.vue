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

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex space-x-4 text-gray-800 font-semibold uppercase">
          <div
            v-for="(item, index) in menuItems"
            :key="item.name"
            class="flex items-center dark:text-white"
          >
            <div v-if="index > 0" class="border-l-2 border-blue-600 h-6 mx-3"></div>

            <div class="group relative">
              <!-- Parent: action item -->
              <button
                v-if="item.action"
                class="hover:text-blue-600"
                @click="handleMenuAction(item.action)"
                type="button"
              >
                {{ item.name }}
              </button>

              <!-- Parent: label-only when submenu (no direct link) -->
              <span v-else-if="item.submenu" class="hover:text-blue-600 cursor-default">
                {{ item.name }}
              </span>

              <!-- Parent: normal link -->
              <nuxt-link
                v-else
                :to="item.link"
                class="hover:text-blue-600"
              >
                {{ item.name }}
              </nuxt-link>

              <!-- Submenu -->
              <ul
                v-if="item.submenu"
                class="submenu absolute hidden group-hover:block shadow-lg bg-white dark:bg-slate-600 z-20"
              >
                <li v-for="sub in item.submenu" :key="sub.name">
                  <!-- Submenu action -->
                  <button
                    v-if="sub.action"
                    type="button"
                    class="hover:text-blue-600 text-sm dark:text-white block p-2 whitespace-nowrap w-full text-left"
                    @click="handleMenuAction(sub.action)"
                  >
                    {{ sub.name }}
                  </button>

                  <!-- Submenu link -->
                  <nuxt-link
                    v-else
                    :to="sub.link"
                    class="hover:text-blue-600 text-sm dark:text-white block p-2 whitespace-nowrap"
                  >
                    {{ sub.name }}
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Right controls -->
        <div class="flex items-center space-x-6">
          <div><ColorMode /></div>
          <button class="lg:hidden block p-2 focus:outline-none" @click="toggleMenu" type="button" aria-label="Open menu">
            <UIcon name="fa:bars" class="w-8 h-8 text-black dark:text-white" />
          </button>
        </div>
      </div>

      <!-- Blue Divider -->
      <div class="border-t-2 border-blue-600"></div>

      <!-- Mobile overlay -->
      <transition
        enter-class="opacity-0"
        enter-active-class="ease-out transition-medium"
        enter-to-class="opacity-100"
        leave-class="opacity-100"
        leave-active-class="ease-out transition-medium"
        leave-to-class="opacity-0"
      >
        <div
          v-show="isOpen"
          class="z-10 fixed inset-0 transition-opacity"
          @keydown.esc="isOpen = false"
        >
          <div
            class="absolute inset-0 bg-black opacity-50"
            tabindex="0"
            @click="isOpen = false"
          />
        </div>
      </transition>

      <!-- Mobile aside -->
      <aside
        class="p-10 transform top-0 left-0 w-64 bg-gray-100 text-gray-600 dark:bg-slate-600 dark:text-gray-100 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30"
        :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="close">
          <button class="absolute top-0 right-0 mt-4 mr-4" @click="isOpen = false" type="button" aria-label="Close menu">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div
          class="border-b-2 border-blue-600 font-sans py-2"
          v-for="item in menuItems"
          :key="item.name"
        >
          <UIcon :name="item.icon" class="w-5 h-5 -translate-x-2" />

          <!-- Mobile parent action -->
          <button
            v-if="item.action"
            @click="() => { handleMenuAction(item.action); isOpen = false }"
            class="divide-y-8 hover:text-blue-600 my-4 inline-block"
            type="button"
          >
            {{ item.name }}
          </button>

          <!-- Mobile parent label when submenu -->
          <span
            v-else-if="item.submenu"
            class="divide-y-8 my-4 inline-block"
          >
            {{ item.name }}
          </span>

          <!-- Mobile parent link -->
          <nuxt-link
            v-else
            :to="item.link"
            class="divide-y-8 hover:text-blue-600 my-4 inline-block"
            @click="isOpen = false"
          >
            {{ item.name }}
          </nuxt-link>

          <!-- Mobile submenu -->
          <div v-if="item.submenu" class="pl-4 space-y-2">
            <div v-for="sub in item.submenu" :key="sub.name" class="flex">
              <UIcon name="ic:outline-star" class="w-3 h-3 -translate-x-1 translate-y-1" />
              <!-- Submenu action -->
              <button
                v-if="sub.action"
                type="button"
                class="hover:text-blue-600 block text-left"
                @click="() => { handleMenuAction(sub.action); isOpen = false }"
              >
                {{ sub.name }}
              </button>
              <!-- Submenu link -->
              <nuxt-link
                v-else
                :to="sub.link"
                class="hover:text-blue-600 block"
                @click="isOpen = false"
              >
                {{ sub.name }}
              </nuxt-link>
            </div>
          </div>
        </div>
      </aside>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrcidLogin } from '~/composables/useOrcidLogin'

const { signInWithOrcid } = useOrcidLogin()

const isLoggedIn = ref(false)
onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('sveltia-cms.user')
})

const menuItems = computed(() => [
  {
    name: 'The Network',
    link: '',
    icon: 'zondicons:network',
    submenu: [
      { name: 'About LeishMan', link: '/about' },
      { name: 'Contact', link: '/contact' },
      { name: 'Global Network', link: '/reference-centers' },
      { name: 'Steering Committee', link: '/steering' }
    ]
  },
  {
    name: 'What We Do ?',
    icon: 'grommet-icons:workshop',
    link: '',
    submenu: [
      { name: 'Seminar/meeting', link: '/seminars' },
      { name: 'Working group', link: '/projects' },
      { name: 'Collaborations', link: '/collaborations' }
    ]
  },


  {
    name: 'Publications',
    icon: 'i-heroicons-light-bulb',
    link: '/publications'
  },
  // MEMBER AREA entry: depends on auth state
  isLoggedIn.value
    ? {
        name: 'ADMIN ' ,
        icon: 'i-heroicons-user-circle',
        submenu: [
          { name: 'Admin Interface', link: '/admin/' },
          { name: 'LOGOUT ' + localStorage.getItem('sveltia-cms.firstname').toUpperCase(), action: 'logout' }
        ]
      }
    : {
        name: 'MEMBER AREA',
        icon: 'i-heroicons-identification',
        action: 'orcid-login-home'
      },

])

const isOpen = ref(false)
const toggleMenu = () => { isOpen.value = !isOpen.value }

function handleMenuAction(action) {
  if (action === 'orcid-login-home') {
    // ORCID popup; on success store Sveltia creds then go HOME
    signInWithOrcid('/')
  }
  if (action === 'logout') {
    // Clear Sveltia session locally
    localStorage.removeItem('sveltia-cms.user')
    localStorage.removeItem('sveltia-cms.userRole')
    localStorage.removeItem('sveltia-cms.firstname')
    localStorage.removeItem('sveltia-cms.lastname')
    localStorage.removeItem('sveltia-cms.orcid')
    localStorage.removeItem('sveltia-cms.userGroups')
    window.location.reload()
  }
}
</script>

<style scoped>
.group:hover .group-hover\:block { display: block; }

.submenu {
  min-width: 200px;
  width: auto;
  padding: 8px;
  padding-top: 20px;
}

.submenu ul { list-style: none; margin: 0; padding: 0; }
</style>