<template>
  <div class="w-full">
    <header
      class="sticky top-0 z-40 border-b border-transparent bg-gradient-to-b from-white to-white/80 backdrop-blur shadow-sm">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <nuxt-link to="/">
          <div class="flex items-center gap-3">
            <img src="/assets/general/logo.webp" alt="LeishMan Network logo"
              class="h-10 w-10 rounded-full border border-white/70 bg-white object-contain shadow-sm" />
            <div>
              <h1 class="text-lg sm:text-xl font-display font-semibold text-slate-900">
                LeishMan Network
              </h1>
              <p class="text-xs text-slate-500">European leishmaniasis network</p>
            </div>
          </div>
        </nuxt-link>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
          <div v-for="(item, index) in menuItems" :key="item.name" class="flex items-center">
            <div v-if="index > 0" class="h-6 w-px bg-slate-200 mx-2"></div>

            <div class="group relative">
              <!-- Parent: action item -->
              <button v-if="item.action" class="transition hover:text-blue-600" @click="handleMenuAction(item.action)"
                type="button">
                {{ item.name }}
              </button>

              <!-- Parent: label-only when submenu (no direct link) -->
              <span v-else-if="item.submenu" class="cursor-default transition hover:text-blue-600">
                {{ item.name }}
              </span>

              <!-- Parent: normal link -->
              <nuxt-link v-else :to="item.link" class="transition hover:text-blue-600">
                {{ item.name }}
              </nuxt-link>

              <!-- Submenu -->
              <ul v-if="item.submenu"
                class="submenu absolute left-0 hidden w-56 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur group-hover:block">
                <li v-for="sub in item.submenu" :key="sub.name">
                  <!-- Submenu action -->
                  <button v-if="sub.action" type="button"
                    class="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
                    @click="handleMenuAction(sub.action)">
                    {{ sub.name }}
                  </button>

                  <!-- Submenu link -->
                  <nuxt-link v-else :to="sub.link"
                    class="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-blue-600">
                    {{ sub.name }}
                  </nuxt-link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Right controls -->
        <div class="flex items-center gap-4">
          <button class="lg:hidden block rounded-lg border border-slate-200 bg-white p-2 shadow-sm"
            :class="isOpen ? 'opacity-0 pointer-events-none' : ''" @click="toggleMenu" type="button"
            aria-label="Open menu">
            <UIcon name="fa:bars" class="h-6 w-6 text-slate-700" />
          </button>
        </div>
      </div>

      <!-- Mobile overlay -->
      <teleport to="body">
        <transition enter-class="opacity-0" enter-active-class="ease-out transition-medium" enter-to-class="opacity-100"
          leave-class="opacity-100" leave-active-class="ease-out transition-medium" leave-to-class="opacity-0">
          <div v-show="isOpen" class="fixed inset-0 z-[980] transition-opacity" @keydown.esc="isOpen = false">
            <div class="absolute inset-0 bg-black/40" tabindex="0" @click="isOpen = false" />
          </div>
        </transition>
      </teleport>

      <!-- Mobile aside -->
      <teleport to="body">
        <aside :class="[
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed top-0 left-0 z-[990] h-full w-72 transform overflow-auto border-r border-slate-200 bg-white px-6 py-10 text-slate-700 transition-all duration-300 ease-in-out'
        ]">
          <div class="close">
            <button class="absolute top-0 right-0 mt-4 mr-4" @click="isOpen = false" type="button"
              aria-label="Close menu">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="border-b border-slate-200 py-3" v-for="item in menuItems" :key="item.name">
            <UIcon :name="item.icon" class="w-5 h-5 -translate-x-1 text-blue-600" />

            <!-- Mobile parent action -->
            <button v-if="item.action" @click="() => { handleMenuAction(item.action); isOpen = false }"
              class="my-3 inline-block text-sm font-semibold uppercase tracking-wide transition hover:text-blue-600"
              type="button">
              {{ item.name }}
            </button>

            <!-- Mobile parent label when submenu -->
            <span v-else-if="item.submenu" class="my-3 inline-block text-sm font-semibold uppercase tracking-wide">
              {{ item.name }}
            </span>

            <!-- Mobile parent link -->
            <nuxt-link v-else :to="item.link"
              class="my-3 inline-block text-sm font-semibold uppercase tracking-wide transition hover:text-blue-600"
              @click="isOpen = false">
              {{ item.name }}
            </nuxt-link>

            <!-- Mobile submenu -->
            <div v-if="item.submenu" class="pl-4 space-y-2">
              <div v-for="sub in item.submenu" :key="sub.name" class="flex items-center">
                <!-- Submenu action -->
                <button v-if="sub.action" type="button" class="block text-left text-sm transition hover:text-blue-600"
                  @click="() => { handleMenuAction(sub.action); isOpen = false }">
                  {{ sub.name }}
                </button>
                <!-- Submenu link -->
                <nuxt-link v-else :to="sub.link" class="block text-sm transition hover:text-blue-600"
                  @click="isOpen = false">
                  {{ sub.name }}
                </nuxt-link>
              </div>
            </div>
          </div>
        </aside>
      </teleport>
    </header>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrcidLogin } from '~/composables/useOrcidLogin'

const { signInWithOrcid } = useOrcidLogin()

const isLoggedIn = ref(false)
const userRole = ref('')
const userFirstname = ref('')

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('sveltia-cms.user')
  userRole.value = localStorage.getItem('sveltia-cms.userRole') || ''
  userFirstname.value = localStorage.getItem('sveltia-cms.firstname') || ''
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
    ? (userRole.value === 'admin'
      ? {
        name: 'ADMIN',
        icon: 'i-heroicons-user-circle',
        submenu: [
          { name: 'Admin Interface', action: 'admin' },
          {
            name: 'LOGOUT ' + userFirstname.value.toUpperCase(),
            action: 'logout'
          }
        ]
      }
      : {
        name: 'MEMBER AREA',
        icon: 'i-heroicons-identification',
        submenu: [
          {
            name: 'LOGOUT ' + userFirstname.value.toUpperCase(),
            action: 'logout'
          }
        ]
      }
    )
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
  if (action === 'admin') {
    window.location.href = '/admin/'
  }
}
</script>

<style scoped>
.group:hover .group-hover\:block {
  display: block;
}

.group {
  position: relative;
}

.group::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: 12px;
}

.submenu {
  min-width: 200px;
  width: auto;
  padding: 8px;
  top: 100%;
  margin-top: 10px;
}

.submenu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
