<template>
  <div class="w-4/5 mx-auto">
    <!-- Title row with back button -->
    <div class="flex items-center justify-between my-8 gap-4">
      <h1 class="text-4xl font-bold m-0 dark:text-white">
        {{ newsItem?.title }}
      </h1>

      <NuxtLink
        to="/projects"
        class="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
        aria-label="All Working Groups"
      >
        <!-- left arrow icon -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h20"/>
        </svg>
        <span class="hidden sm:inline">All Working Groups</span>
        <span class="sm:hidden">Back</span>
      </NuxtLink>
    </div>

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
          <div v-if="authPending" class="text-sm text-gray-500">Checking access…</div>
          <div v-else-if="!isAuthorized" class="text-sm text-red-600">
            You don’t have access to “{{ targetFolderName }}”.
          </div>

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

/* ---------- Main content ---------- */
const newsItem = await queryContent('project').where({ title: route.params.slug }).findOne()
const md = new MarkdownIt()
const renderedHtml = md.render(newsItem?.description || '')

/* ---------- Groups & mapping ---------- */
const GROUP_TO_FOLDERS = {
  'biobanking': ['Biobanking'],
  'diagnostic': ['Diagnostic-procedure'],
  'diagnostic-procedure': ['Diagnostic-procedure'],
  'epidemiology': ['Epidemiology'],
  'lc': ['LC-treatment'],
  'lc-treatment': ['LC-treatment'],
  'lv': ['VL-treatment','LV-treatment'],
  'visceral': ['VL-treatment','LV-treatment'],
  'recommendations': ['Recommendations','Recommandations'],
  'admin': ['Admin-Files']
}
function normalize(s){return String(s||'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().trim()}
function mapSlugToFolderName(slug){
  const n=normalize(slug)
  if(n==='recommandations') return 'Recommendations'
  return slug||''
}

/* ---------- WebDAV constants ---------- */
const WEBDAV_ROOT = '/remote.php/dav/files/quentin'   // absolute prefix
const userRootAbs = WEBDAV_ROOT                       // alias

// helpers to convert between absolute and relative (no leading slash for rel)
function toRel(abs){
  return decodeURIComponent(String(abs||''))
    .replace(/\/{2,}/g,'/')
    .replace(new RegExp('^'+userRootAbs.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'/'), '')
    .replace(/^\/+/,'')
}
function toAbs(rel){
  const r = String(rel||'').replace(/^\/+/,'')
  return `${userRootAbs}/${r}`.replace(/\/{2,}/g,'/')
}

/* ---------- Authorization ---------- */
const groups = ref([])
function loadGroups(){
  try{
    if(!process.client) return
    const raw = localStorage.getItem('sveltia-cms.userGroups')
    let parsed = raw ? JSON.parse(raw) : []
    if(typeof parsed === 'string') parsed = JSON.parse(parsed)
    groups.value = Array.isArray(parsed) ? parsed : []
  }catch{ groups.value=[] }
}
function computeAllowedTopFolders(userGroups){
  const out=new Set()
  for(const g of userGroups){
    const k=normalize(g)
    const mapped=GROUP_TO_FOLDERS[k]
    if(mapped) for(const name of mapped) out.add(name)
  }
  return out
}

const targetFolderName = mapSlugToFolderName(newsItem?.slug || '')
const authPending = ref(true)
const isAuthorized = ref(false)

/* ---------- Browsing state (RELATIVE for listing) ---------- */
const relRoot = ref('')        // e.g. "Recommendations"
const relCurrent = ref('')     // e.g. "Recommendations/Documents"
const folders = ref([])        // as returned by Worker
const files   = ref([])
const pending = ref(false)
const error   = ref(null)

const crumbs = computed(() =>
  relCurrent.value && relRoot.value
    ? relCurrent.value.replace(new RegExp('^'+relRoot.value+'/'), '')
        .split('/').filter(Boolean)
    : []
)
const canGoUp = computed(() => relCurrent.value && relCurrent.value !== relRoot.value)

/* ---------- Navigation ---------- */
function goRoot(){
  relCurrent.value = relRoot.value
  fetchList()
}
function goTo(index){
  const sub = crumbs.value.slice(0,index+1).join('/')
  relCurrent.value = sub ? `${relRoot.value}/${sub}` : relRoot.value
  fetchList()
}
function openDir(absPath){
  // Worker returned absolute `path`; convert to relative for state & next query
  const rel = toRel(absPath)
  relCurrent.value = rel
  fetchList()
}
function goUp(){
  if(!canGoUp.value) return
  const parts = relCurrent.value.split('/').filter(Boolean)
  parts.pop()
  const up = parts.join('/')
  relCurrent.value = up || relRoot.value
  if(!relCurrent.value.startsWith(relRoot.value)) relCurrent.value = relRoot.value
  fetchList()
}

/* ---------- File actions ---------- */
function iconFor(f){
  const m=f.mime||''
  if(m.startsWith('image/')) return '🖼️'
  if(m.includes('pdf')) return '📄'
  return '📎'
}
function download(absPath){
  const u = new URL('/api/nextcloud/download', workerBase)
  u.searchParams.set('file', absPath) // download expects ABSOLUTE path
  window.open(u.toString(), '_blank')
}
async function previewOrDownload(file){
  const ext = file.path.split('.').pop()?.toLowerCase() || ''
  const previewable = ['jpg','jpeg','png','gif','pdf','md','docx','odt']
  if(!previewable.includes(ext)){ download(file.path); return }
  try{
    const u = new URL('/api/nextcloud/share', workerBase)
    u.searchParams.set('file', file.path) // ABSOLUTE for share
    const r = await fetch(u.toString(), { headers: { 'X-User-Groups': groups.value.join(',') } })
    const data = await r.json()
    if(data?.url) window.open(data.url,'_blank'); else download(file.path)
  }catch{ download(file.path) }
}

/* ---------- List (RELATIVE for Worker) ---------- */
async function fetchList(){
  pending.value = true
  error.value = null
  try{
    const url = new URL('/api/nextcloud/files', workerBase)
    if(relCurrent.value) url.searchParams.set('folder', relCurrent.value) // RELATIVE path only

    const res = await fetch(url.toString(), {
      method:'GET',
      headers:{ 'X-User-Groups': groups.value.join(',') } // optional ACL header
    })
    if(!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    folders.value = Array.isArray(data.folders) ? data.folders : []
    files.value   = Array.isArray(data.files)   ? data.files   : []
  }catch(e){
    error.value = e
    folders.value=[]
    files.value=[]
  }finally{
    pending.value = false
  }
}

/* ---------- Bootstrap ---------- */
onMounted(async ()=>{
  loadGroups()
  const allowed = computeAllowedTopFolders(groups.value)
  isAuthorized.value = allowed.has(targetFolderName) || allowed.has(mapSlugToFolderName(targetFolderName))
  authPending.value = false
  if(!isAuthorized.value) return

  // Set RELATIVE roots
  relRoot.value = targetFolderName
  relCurrent.value = relRoot.value
  await fetchList()
})
</script>
