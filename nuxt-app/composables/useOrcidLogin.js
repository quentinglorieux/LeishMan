// Member login with ORCID (popup handled by the "orcid-sveltia" Cloudflare worker).
//
// Storage (localStorage, same origin as the CMS so one login serves both):
//   leishman.session          signed session token, checked by the Nextcloud worker
//   sveltia-cms.user          GitHub token for the CMS (admins/editors only)
//   sveltia-cms.userRole / firstname / lastname / orcid / userGroups   profile (legacy keys)

const SESSION_KEY = 'leishman.session'
const LEGACY_KEYS = [
  'sveltia-cms.user',
  'sveltia-cms.userRole',
  'sveltia-cms.firstname',
  'sveltia-cms.lastname',
  'sveltia-cms.orcid',
  'sveltia-cms.userGroups',
]

/** Legacy group labels (old login worker) -> Nextcloud folder */
const LEGACY_GROUPS = {
  biobanking: 'Biobanking',
  diagnostic: 'Diagnostic-procedure',
  'diagnostic-procedure': 'Diagnostic-procedure',
  epidemiology: 'Epidemiology',
  lc: 'LC-treatment',
  'lc-treatment': 'LC-treatment',
  lv: 'VL-treatment',
  'lv-treatment': 'VL-treatment',
  vl: 'VL-treatment',
  'vl-treatment': 'VL-treatment',
  recommendations: 'Recommendations',
  recommandations: 'Recommendations',
  admin: '*',
}

function readJSON (key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    let v = JSON.parse(raw)
    if (typeof v === 'string') v = JSON.parse(v)
    return v ?? fallback
  } catch {
    return fallback
  }
}

/** Decode (not verify: the worker verifies) the payload of a session token. */
function decodeSession (token) {
  try {
    const part = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(part + '==='.slice((part.length + 3) % 4))
    const json = new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)))
    const p = JSON.parse(json)
    if (!p.exp || p.exp * 1000 < Date.now()) return null
    return p
  } catch {
    return null
  }
}

export function useOrcidLogin () {
  const config = useRuntimeConfig()
  const authURL = config.public.orcidAuthUrl || 'https://orcid-sveltia.quentin-glorieux.workers.dev/auth/orcid'
  const authOrigin = new URL(authURL).origin

  // shared reactive state across components
  const member = useState('leishman-member', () => null)

  /** Read the current session from localStorage (call on the client, e.g. in onMounted). */
  function refresh () {
    if (!import.meta.client) return member.value
    const token = localStorage.getItem(SESSION_KEY)
    const payload = token ? decodeSession(token) : null
    if (payload) {
      member.value = {
        token,
        orcid: payload.sub,
        firstname: payload.fn || '',
        lastname: payload.ln || '',
        role: payload.role || 'viewer',
        folders: payload.folders || [],
        legacy: false,
      }
      return member.value
    }
    if (token) localStorage.removeItem(SESSION_KEY) // expired
    // Legacy login (old worker, no signed session)
    const groups = readJSON('sveltia-cms.userGroups', [])
    const role = localStorage.getItem('sveltia-cms.userRole')
    if (role || groups.length) {
      const folders = [...new Set(groups.map(g => LEGACY_GROUPS[String(g).trim().toLowerCase()] || g))]
      member.value = {
        token: null,
        orcid: localStorage.getItem('sveltia-cms.orcid') || '',
        firstname: localStorage.getItem('sveltia-cms.firstname') || '',
        lastname: localStorage.getItem('sveltia-cms.lastname') || '',
        role: role || 'viewer',
        folders: role === 'admin' || folders.includes('*') ? ['*'] : folders,
        legacy: true,
        groups,
      }
    } else {
      member.value = null
    }
    return member.value
  }

  function canRead (folder) {
    const f = member.value?.folders || []
    return !!folder && (f.includes('*') || f.includes(folder))
  }

  /** Headers for the Nextcloud worker. */
  function authHeaders () {
    const h = {}
    if (member.value?.token) h.Authorization = `Bearer ${member.value.token}`
    if (member.value?.groups?.length) h['X-User-Groups'] = member.value.groups.join(',') // legacy worker
    return h
  }

  function store (d) {
    if (d.session) localStorage.setItem(SESSION_KEY, d.session)
    if (d.token) {
      localStorage.setItem('sveltia-cms.user', JSON.stringify({ backendName: 'github', token: d.token }))
    } else {
      localStorage.removeItem('sveltia-cms.user')
    }
    if (d.role) localStorage.setItem('sveltia-cms.userRole', d.role)
    if (d.firstname) localStorage.setItem('sveltia-cms.firstname', d.firstname)
    if (d.lastname) localStorage.setItem('sveltia-cms.lastname', d.lastname)
    if (d.orcid) localStorage.setItem('sveltia-cms.orcid', d.orcid)
    if (d.groups) localStorage.setItem('sveltia-cms.userGroups', JSON.stringify(d.groups))
  }

  /** Opens the ORCID popup. Resolves with the member, or null if the popup was closed. */
  function signIn () {
    return new Promise((resolve) => {
      const w = 600
      const h = 760
      const y = window.top.outerHeight / 2 + window.top.screenY - h / 2
      const x = window.top.outerWidth / 2 + window.top.screenX - w / 2
      const url = `${authURL}?origin=${encodeURIComponent(window.location.origin)}&mode=site`
      const popup = window.open(url, 'orcid-auth', `width=${w},height=${h},left=${x},top=${y},resizable,scrollbars`)

      let done = false
      let timer = null
      const finish = (value) => {
        if (done) return
        done = true
        window.removeEventListener('message', onMessage)
        clearInterval(timer)
        resolve(value)
      }
      const onMessage = (event) => {
        if (event.origin !== authOrigin) return
        const d = event.data || {}
        if (!d.session && !d.groups && !d.token) return
        try {
          store(d)
        } catch (e) {
          console.error('Failed to persist login', e)
        }
        try { popup && popup.close() } catch {}
        finish(refresh())
      }
      window.addEventListener('message', onMessage)
      timer = setInterval(() => {
        if (!popup || popup.closed) finish(refresh())
      }, 800)
    })
  }

  /** Kept for the navigation bar: login then optionally go to `redirectTo`. */
  async function signInWithOrcid (redirectTo = null) {
    const m = await signIn()
    if (m && redirectTo) window.location.assign(redirectTo)
  }

  function signOut () {
    localStorage.removeItem(SESSION_KEY)
    for (const k of LEGACY_KEYS) localStorage.removeItem(k)
    member.value = null
  }

  return { member, refresh, canRead, authHeaders, signIn, signInWithOrcid, signOut }
}
