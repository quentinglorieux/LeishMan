<template>
  <div class="space-y-8">
    <!-- Title row with back button -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Working group</p>
        <div class="flex items-center gap-3">
          <img
            v-if="group?.image"
            :src="group.image"
            :alt="group.title"
            class="h-12 w-12 rounded-full border border-white/70 object-cover shadow-sm"
          />
          <h1 class="font-display text-3xl sm:text-4xl text-slate-900">
            {{ group?.title }}
          </h1>
        </div>
      </div>

      <NuxtLink
        to="/projects"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        aria-label="All working groups"
      >
        <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
        <span class="hidden sm:inline">All working groups</span>
        <span class="sm:hidden">Back</span>
      </NuxtLink>
    </div>

    <div v-if="!group" class="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
      This working group does not exist (anymore).
    </div>

    <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <!-- Left column: description + members -->
      <div class="space-y-8 lg:col-span-2">
        <div v-if="introHtml" class="prose max-w-none text-slate-700" v-html="introHtml" />

        <section aria-labelledby="members-title">
          <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="members-title" class="font-display text-2xl text-slate-900">Members</h2>
              <p class="text-sm text-slate-500">
                {{ members.length }} member{{ members.length > 1 ? 's' : '' }}
                <template v-if="leaders.length"> · {{ leaders.length }} group leader{{ leaders.length > 1 ? 's' : '' }}</template>
              </p>
            </div>
            <label v-if="members.length > 8" class="relative block w-full sm:w-64">
              <span class="sr-only">Filter members</span>
              <UIcon name="i-heroicons-magnifying-glass" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                v-model="memberQuery"
                type="search"
                placeholder="Filter by name or institution"
                class="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>

          <ul v-if="filteredMembers.length" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <li
              v-for="m in filteredMembers"
              :key="m.key"
              class="flex items-start gap-3 rounded-2xl border bg-white/90 p-3 shadow-sm transition hover:shadow-md"
              :class="m.leader ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'"
            >
              <img
                v-if="m.thumbnail"
                :src="m.thumbnail"
                :alt="m.name"
                loading="lazy"
                class="h-12 w-12 shrink-0 rounded-full object-cover object-top"
              />
              <span
                v-else
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                :style="{ background: m.color }"
                aria-hidden="true"
              >{{ m.initials }}</span>

              <div class="min-w-0 flex-1">
                <p class="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold leading-tight text-slate-900">
                  <span>{{ m.name }}</span>
                  <span
                    v-if="m.leader"
                    class="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue-700"
                  >Group leader</span>
                </p>
                <p v-if="m.laboratory" class="mt-1 text-xs leading-snug text-slate-500">{{ m.laboratory }}</p>
                <a
                  v-if="m.orcid"
                  :href="`https://orcid.org/${m.orcid}`"
                  target="_blank"
                  rel="noopener"
                  class="mt-1 inline-flex items-center gap-1 text-xs text-[#5a8a00] hover:underline"
                  :aria-label="`ORCID profile of ${m.name}`"
                >
                  <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#a6ce39] text-[9px] font-bold text-white">iD</span>
                  ORCID profile
                </a>
              </div>
            </li>
          </ul>
          <p v-else-if="members.length" class="text-sm text-slate-500">No member matches “{{ memberQuery }}”.</p>
          <p v-else class="text-sm text-slate-500">The member list of this group has not been published yet.</p>
        </section>
      </div>

      <!-- Right column: private documents (Nextcloud through the Cloudflare worker) -->
      <aside class="lg:col-span-1">
        <div class="sticky top-6 rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-lg">
          <div class="mb-4 flex items-center justify-between gap-2">
            <h2 class="font-display text-2xl">Documents</h2>
            <UIcon name="i-heroicons-lock-closed" class="h-5 w-5 text-slate-400" aria-label="Private" />
          </div>

          <!-- not signed in -->
          <div v-if="!ready" class="text-sm text-slate-500">Checking access…</div>
          <div v-else-if="!member" class="space-y-3 text-sm text-slate-600">
            <p>Group documents are private. Members of this group can sign in with their ORCID iD.</p>
            <button
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#a6ce39] px-4 py-2 font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
              :disabled="signingIn"
              @click="login"
            >
              <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#a6ce39]">iD</span>
              {{ signingIn ? 'Waiting for ORCID…' : 'Member login with ORCID' }}
            </button>
          </div>

          <!-- signed in, no access -->
          <div v-else-if="!hasAccess" class="space-y-3 text-sm text-slate-600">
            <p>
              Signed in as <strong>{{ member.firstname }} {{ member.lastname }}</strong>, but you are not a member of this group.
            </p>
            <p>If you should have access, ask the coordinators to add you (with your ORCID iD) to the member list.</p>
            <button class="text-xs text-slate-500 underline" @click="logout">Sign out</button>
          </div>

          <!-- browser -->
          <div v-else class="space-y-3">
            <nav class="flex flex-wrap items-center gap-1 text-xs text-slate-500" aria-label="Folder path">
              <template v-for="(crumb, i) in breadcrumbs" :key="crumb.path">
                <span v-if="i > 0">/</span>
                <button
                  class="rounded px-1 hover:bg-slate-100 hover:text-slate-800"
                  :class="i === breadcrumbs.length - 1 ? 'font-semibold text-slate-800' : ''"
                  @click="goTo(crumb.path)"
                >{{ crumb.name }}</button>
              </template>
            </nav>

            <div v-if="pending" class="text-sm text-slate-500">Loading…</div>
            <div v-else-if="error" class="text-sm text-red-600">
              {{ error }}
              <button class="ml-1 underline" @click="fetchList">Retry</button>
            </div>
            <template v-else>
              <ul class="divide-y divide-slate-100">
                <li v-if="relCurrent !== relRoot">
                  <button class="flex w-full items-center gap-2 py-2 text-left text-sm text-slate-600 hover:text-blue-700" @click="goUp">
                    <UIcon name="i-heroicons-arrow-uturn-left" class="h-4 w-4" /> Back
                  </button>
                </li>
                <li v-for="dir in folders" :key="dir.path">
                  <button class="flex w-full items-center gap-2 py-2 text-left text-sm text-slate-800 hover:text-blue-700" @click="openDir(dir.path)">
                    <UIcon name="i-heroicons-folder" class="h-5 w-5 shrink-0 text-amber-500" />
                    <span class="break-words">{{ dir.name }}</span>
                  </button>
                </li>
                <li v-for="f in files" :key="f.path" class="flex items-center gap-2 py-2">
                  <button class="flex min-w-0 flex-1 items-center gap-2 text-left text-sm text-slate-800 hover:text-blue-700" :title="`Open ${f.name}`" @click="openFile(f)">
                    <UIcon :name="iconFor(f.name)" class="h-5 w-5 shrink-0 text-slate-400" />
                    <span class="break-words">{{ f.name }}</span>
                  </button>
                  <button class="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" :aria-label="`Download ${f.name}`" @click="downloadFile(f)">
                    <UIcon name="i-heroicons-arrow-down-tray" class="h-4 w-4" />
                  </button>
                </li>
              </ul>
              <p v-if="!folders.length && !files.length" class="text-sm text-slate-500">No documents here yet.</p>
            </template>

            <p class="border-t border-slate-100 pt-3 text-xs text-slate-500">
              Signed in as {{ member.firstname }} {{ member.lastname }} ·
              <button class="underline" @click="logout">Sign out</button>
            </p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const { public: { workerBase } } = useRuntimeConfig()
const { member, refresh, canRead, authHeaders, signIn, signOut } = useOrcidLogin()

/* ---------- Content ---------- */
const slugParam = String(route.params.slug || '')
const { data: group } = await useAsyncData(`group-${slugParam}`, async () =>
  (await queryCollection('projects').where('title', '=', slugParam).first()) ||
  (await queryCollection('projects').where('slug', '=', slugParam).first())
)
const { data: allMembers } = await useAsyncData('all-members', () => queryCollection('members').all())

useHead(() => ({ title: group.value ? `${group.value.title} · LeishMan` : 'Working group · LeishMan' }))

const md = new MarkdownIt({ linkify: true })
const introHtml = computed(() => {
  const parts = [group.value?.shortdescription, group.value?.description].filter(Boolean)
  return parts.length ? md.render(parts.join('\n\n')) : ''
})

/* ---------- Members ---------- */
const PALETTE = ['#2563eb', '#0891b2', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0d9488', '#4f46e5']
function colorFor (s) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
}

const members = computed(() => {
  const byStem = new Map((allMembers.value || []).map(m => [String(m.stem || '').split('/').pop(), m]))
  const list = (group.value?.members || [])
    .map((ref, index) => {
      const m = byStem.get(ref.member)
      if (!m) return null
      const name = `${m.firstname || ''} ${m.lastname || ''}`.trim()
      const initials = `${(m.firstname || ' ')[0]}${(m.lastname || ' ')[0]}`.toUpperCase().trim()
      return {
        key: ref.member,
        index,
        name,
        initials,
        color: colorFor(name),
        leader: !!ref.leader,
        laboratory: m.laboratory || '',
        orcid: m.orcid || '',
        thumbnail: m.thumbnail || '',
      }
    })
    .filter(Boolean)
  // leaders first, then the order chosen in the CMS
  return list.sort((a, b) => Number(b.leader) - Number(a.leader) || a.index - b.index)
})
const leaders = computed(() => members.value.filter(m => m.leader))

const memberQuery = ref('')
const filteredMembers = computed(() => {
  const q = memberQuery.value.trim().toLowerCase()
  if (!q) return members.value
  return members.value.filter(m => `${m.name} ${m.laboratory}`.toLowerCase().includes(q))
})

/* ---------- Documents ---------- */
const folderName = computed(() => group.value?.folder || '')
const ready = ref(false)
const signingIn = ref(false)
const hasAccess = computed(() => canRead(folderName.value))

const relRoot = computed(() => folderName.value)
const relCurrent = ref('')
const folders = ref([])
const files = ref([])
const pending = ref(false)
const error = ref('')

const WEBDAV_PREFIX = /^\/?remote\.php\/dav\/files\/[^/]+\//
function toRel (abs) {
  return decodeURIComponent(String(abs || '')).replace(WEBDAV_PREFIX, '').replace(/^\/+|\/+$/g, '')
}

const breadcrumbs = computed(() => {
  const parts = relCurrent.value.split('/').filter(Boolean)
  return parts.map((name, i) => ({ name, path: parts.slice(0, i + 1).join('/') }))
})

function iconFor (name) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'i-heroicons-photo'
  if (ext === 'pdf') return 'i-heroicons-document-text'
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'i-heroicons-table-cells'
  if (['ppt', 'pptx', 'odp'].includes(ext)) return 'i-heroicons-presentation-chart-bar'
  return 'i-heroicons-document'
}

async function workerFetch (path, params) {
  const url = new URL(path, workerBase)
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v)
  const res = await fetch(url, { headers: authHeaders() })
  if (res.status === 401) {
    signOut()
    throw new Error('Your session has expired, please sign in again.')
  }
  if (res.status === 403) throw new Error('You do not have access to this folder.')
  if (!res.ok) throw new Error(`The document server returned an error (${res.status}).`)
  return res
}

async function fetchList () {
  if (!hasAccess.value) return
  pending.value = true
  error.value = ''
  try {
    const res = await workerFetch('/api/nextcloud/files', { folder: relCurrent.value })
    const data = await res.json()
    // Depth-2 listing: keep only the direct children of the current folder
    const depth = relCurrent.value.split('/').filter(Boolean).length
    const isChild = (p) => toRel(p).split('/').filter(Boolean).length === depth + 1
    folders.value = (data.folders || []).filter(f => isChild(f.path) && toRel(f.path) !== relCurrent.value)
    files.value = (data.files || []).filter(f => isChild(f.path))
  } catch (e) {
    error.value = e.message
    folders.value = []
    files.value = []
  } finally {
    pending.value = false
  }
}

function goTo (rel) {
  if (!rel.startsWith(relRoot.value)) rel = relRoot.value
  relCurrent.value = rel
  fetchList()
}
function openDir (absPath) { goTo(toRel(absPath)) }
function goUp () {
  const parts = relCurrent.value.split('/').filter(Boolean)
  parts.pop()
  goTo(parts.join('/'))
}

async function fileBlob (f, inline) {
  const res = await workerFetch('/api/nextcloud/download', { file: f.path, ...(inline ? { inline: '1' } : {}) })
  return URL.createObjectURL(await res.blob())
}

async function openFile (f) {
  const ext = f.name.split('.').pop()?.toLowerCase() || ''
  const previewable = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'txt'].includes(ext)
  if (!previewable) return downloadFile(f)
  const win = window.open('', '_blank') // open now, to avoid popup blockers
  try {
    const url = await fileBlob(f, true)
    if (win) win.location.href = url
    else window.location.href = url
  } catch (e) {
    if (win) win.close()
    error.value = e.message
  }
}

async function downloadFile (f) {
  try {
    const url = await fileBlob(f, false)
    const a = document.createElement('a')
    a.href = url
    a.download = f.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (e) {
    error.value = e.message
  }
}

async function login () {
  signingIn.value = true
  try {
    await signIn()
  } finally {
    signingIn.value = false
  }
}

function logout () {
  signOut()
  folders.value = []
  files.value = []
}

watch(hasAccess, (ok) => {
  if (ok) {
    relCurrent.value = relRoot.value
    fetchList()
  }
})

onMounted(() => {
  refresh()
  ready.value = true
  if (hasAccess.value) {
    relCurrent.value = relRoot.value
    fetchList()
  }
})
</script>
