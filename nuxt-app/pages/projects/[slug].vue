<template>
  <div class="w-4/5 mx-auto">
    <h1 class="text-4xl font-bold my-8">{{ newsItem?.title }}</h1>
    <p>{{ newsItem?.date }}</p>
    <img
      v-if="newsItem?.image"
      :src="newsItem?.image"
      :alt="newsItem?.title"
      class="w-full h-64 object-cover mb-6"
    />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left column: main content -->
      <div class="lg:col-span-2">
        <div class="prose dark:prose-invert pt-10" v-html="renderedHtml" />
      </div>

      <!-- Right column: Nextcloud files via Cloudflare Worker -->
      <aside class="lg:col-span-1">
        <div class="sticky top-8">
          <h2 class="text-2xl font-semibold mb-4 pt-10">Documents</h2>

          <!-- Breadcrumb 
          <nav v-if="crumbs.length" class="text-sm mb-3 flex flex-wrap gap-x-1">
            <button class="text-blue-600 hover:underline" @click="goRoot()">
              {{ slug }}
            </button>
            <template v-for="(c, i) in crumbs" :key="i">
              <span>/</span>
              <button class="text-blue-600 hover:underline" @click="goTo(i)">
                {{ c }}
              </button>
            </template>
          </nav>-->

          <div v-if="pending" class="text-sm text-gray-500">Loading…</div>
          <div v-else-if="error" class="text-sm text-red-500">Failed to load documents.</div>

          <div v-else class="space-y-4">
            <!-- Folders -->
            <ul v-if="folders.length" class="space-y-2">
              <li v-for="dir in folders" :key="dir.path" class="flex items-center justify-between">
                <button class="text-blue-600 hover:underline break-words" @click="openDir(dir.path)">
                  📁 {{ dir.name }}
                </button>
              </li>
            </ul>

            <!-- Files -->
            <ul v-if="files.length" class="space-y-2">
              <li v-for="f in files" :key="f.path" class="flex items-center justify-between">
                <button class="text-left text-blue-600 hover:underline break-words" @click="previewOrDownload(f)">
                  {{ iconFor(f) }} {{ f.name }}
                </button>
                <button class="text-xs text-gray-500 hover:underline" @click="download(f.path)">Download</button>
              </li>
            </ul>

            <div v-if="!folders.length && !files.length" class="text-sm text-gray-500">
              No documents here yet.
            </div>

            <div v-if="canGoUp" class="pt-2">
              <button class="text-blue-600 hover:underline text-sm" @click="goUp">⤴︎ Up</button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const { public: { workerBase } } = useRuntimeConfig()

// ---- Main content (reads front-matter, including `slug`) ----
const newsItem = await queryContent('project').where({ title: route.params.slug }).findOne()
const md = new MarkdownIt()
const renderedHtml = md.render(newsItem?.description || '')

// Folder segment comes from front-matter `slug`
// e.g. front-matter has: slug: Recommandations
const folderSegment = String(newsItem?.slug || '').trim()

// Abort early if missing; fall back to safe default
const projectRoot = folderSegment ? `${folderSegment}` : '/project'

// ---- Sidebar state ----
const currentFolder = ref(projectRoot)
const folders = ref([])
const files = ref([])
const groups = ref([])   // from localStorage
const pending = ref(false)
const error = ref(null)

// UI helpers

const canGoUp = computed(() => currentFolder.value !== projectRoot)

// Load groups array from localStorage (handles JSON-in-string)
function loadGroups() {
  try {
    if (!process.client) return
    const raw = localStorage.getItem('sveltia-cms.userGroups')
    let parsed = raw ? JSON.parse(raw) : []
    if (typeof parsed === 'string') parsed = JSON.parse(parsed)
    groups.value = Array.isArray(parsed) ? parsed : []
  } catch { groups.value = [] }
}


function openDir(path) {
  currentFolder.value = path
  fetchList()
}
function goUp() {
  if (!canGoUp.value) return
  const seg = currentFolder.value.split('/').filter(Boolean); seg.pop()
  let up = '/' + seg.join('/')
  if (!up.startsWith(projectRoot)) up = projectRoot
  currentFolder.value = up
  fetchList()
}

function iconFor(f) {
  const m = f.mime || ''
  if (m.startsWith('image/')) return '🖼️'
  if (m.includes('pdf')) return '📄'
  return '📎'
}

function download(path) {
  const u = new URL('/api/nextcloud/download', workerBase)
  u.searchParams.set('file', path)
  window.open(u.toString(), '_blank')
}

async function previewOrDownload(file) {
  const ext = file.path.split('.').pop()?.toLowerCase() || ''
  const previewable = ['jpg','jpeg','png','gif','pdf','md','docx','odt']
  if (!previewable.includes(ext)) { download(file.path); return }
  try {
    const u = new URL('/api/nextcloud/share', workerBase)
    u.searchParams.set('file', file.path)
    const res = await fetch(u.toString(), {
      method: 'GET',
      headers: { 'X-User-Groups': groups.value.join(',') } // let Worker enforce ACL
      // no credentials — compatible with ACAO: *
    })
    const data = await res.json()
    if (data?.url) window.open(data.url, '_blank'); else download(file.path)
  } catch { download(file.path) }
}

function pathHasAnyGroup(p) {
  const dec = decodeURIComponent(p)
  return groups.value.some(g => dec.includes(`/${g}/`) || dec.endsWith(`/${g}`))
}

// List current folder from Worker
async function fetchList() {
  pending.value = true
  error.value = null
  try {
    // If your Worker expects a *relative* path from user root, strip WebDAV prefix if present
    const rel = currentFolder.value
      .replace(/^\/?remote\.php\/dav\/files\/quentin\//, '')
      .replace(/^\/+/, '')

    const url = new URL('/api/nextcloud/files', workerBase)
    if (rel) url.searchParams.set('folder', rel)

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'X-User-Groups': groups.value.join(',') }
      // no credentials
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // Defensive client-side filtering by groups
    const fds = Array.isArray(data.folders) ? data.folders : []
    const fls = Array.isArray(data.files) ? data.files : []

    const allowedFolders = fds.filter(fd => pathHasAnyGroup(fd.path))
    const allowedFiles = fls.filter(fl => {
      const dec = decodeURIComponent(fl.path)
      return allowedFolders.some(fd => dec.startsWith(decodeURIComponent(fd.path)))
    })

    folders.value = allowedFolders
    files.value = allowedFiles
  } catch (e) {
    error.value = e
    folders.value = []
    files.value = []
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  loadGroups()
  console.log('projectRoot', projectRoot)
  currentFolder.value = projectRoot
  fetchList()
})
</script>