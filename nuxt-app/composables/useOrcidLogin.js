    // composables/useOrcidLogin.js
export function useOrcidLogin () {
  const WORKER_AUTH_URL = 'https://orcid-sveltia.quentin-glorieux.workers.dev/auth/orcid'
  const REDIRECT_KEY = 'sveltia-cms.redirectTo'

  function openCenteredPopup (url, name, w = 600, h = 800) {
    const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2)
    const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2)
    return window.open(
      url,
      name,
      `width=${w},height=${h},left=${x},top=${y},resizable,scrollbars`
    )
  }

  function signInWithOrcid (redirectTo = '/') {
    try { localStorage.setItem(REDIRECT_KEY, redirectTo) } catch {}
    const popup = openCenteredPopup(WORKER_AUTH_URL, 'orcid-auth')

    // One-shot message handler
    const onMessage = (event) => {
      const d = event?.data || {}
      if (d.backendName === 'github' && d.token) {
        try {
          // Mirror Sveltia’s storage contract
          localStorage.setItem('sveltia-cms.user', JSON.stringify({
            backendName: 'github',
            token: d.token
          }))
          if (d.role)       localStorage.setItem('sveltia-cms.userRole', d.role)
          if (d.firstname)  localStorage.setItem('sveltia-cms.firstname', d.firstname)
          if (d.lastname)   localStorage.setItem('sveltia-cms.lastname', d.lastname)
          if (d.orcid)      localStorage.setItem('sveltia-cms.orcid', d.orcid)
          if (d.groups)     localStorage.setItem('sveltia-cms.userGroups', JSON.stringify(d.groups))
        } catch (e) {
          console.error('Failed to persist auth info', e)
        }

        window.removeEventListener('message', onMessage)
        try { popup && popup.close() } catch {}

        // Redirect
        let target = '/'
        try {
          target = localStorage.getItem(REDIRECT_KEY) || '/'
          localStorage.removeItem(REDIRECT_KEY)
        } catch {}
        window.location.assign(target)
      }
    }

    window.addEventListener('message', onMessage)
  }

  return { signInWithOrcid }
}