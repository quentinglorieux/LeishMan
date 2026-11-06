<script>
  // LeishMan: Nextcloud documents of the working groups, through the nextcloud-leishman worker.
  // Access is enforced by the worker from the signed session (leishman.session).
  // Write actions (upload, new folder, delete, share) are admin only on the worker side;
  // the buttons are only shown to admins.
  import { Icon } from '@sveltia/ui';
  import { onDestroy, onMount } from 'svelte';

  import { cmsConfig } from '$lib/services/config';

  const DAV_PREFIX = /^\/?remote\.php\/dav\/files\/[^/]+\/?/;
  const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const TEXT_TYPES = ['md', 'txt', 'tex', 'csv', 'json', 'yml', 'yaml', 'bib'];
  const OFFICE_TYPES = ['doc', 'docx', 'odt', 'ods', 'xls', 'xlsx', 'ppt', 'pptx', 'odp'];

  /** @type {string[]} decoded path segments of the open folder */
  let current = $state([]);
  /** @type {any[]} */
  let items = $state([]);
  let loading = $state(true);
  let busy = $state('');
  let error = $state('');
  let notice = $state('');
  let query = $state('');
  let sortKey = $state('name');
  let sortAsc = $state(true);
  let newFolderOpen = $state(false);
  let newFolderName = $state('');
  let dragging = $state(false);
  /** @type {{ name: string, kind: string, url?: string, text?: string, path: string } | null} */
  let preview = $state(null);
  let editorText = $state('');
  let saving = $state(false);
  /** @type {HTMLInputElement | undefined} */
  let fileInput = $state();

  const cache = new Map();
  let noticeTimer;

  /* ---------- session ---------- */

  function sessionToken() {
    return localStorage.getItem('leishman.session') || '';
  }

  function sessionRole() {
    const token = sessionToken();
    if (token.includes('.')) {
      try {
        const data = token.split('.')[0].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(
          new TextDecoder().decode(Uint8Array.from(atob(data), (c) => c.charCodeAt(0))),
        );
        if (payload?.role) return payload.role;
      } catch {
        // fall through to the legacy role
      }
    }
    return localStorage.getItem('sveltia-cms.userRole') || 'viewer';
  }

  const canWrite = sessionRole() === 'admin';

  function workerBase() {
    return (
      $cmsConfig?.sveltia?.nextcloudWorkerBase ||
      'https://nextcloud-leishman.quentin-glorieux.workers.dev'
    );
  }

  function authHeaders(extra = {}) {
    const headers = { ...extra };
    const token = sessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  async function api(path, options = {}) {
    const res = await fetch(`${workerBase()}${path}`, {
      ...options,
      headers: authHeaders(options.headers),
    });
    if (!res.ok) {
      let message = res.statusText;
      try {
        message = (await res.json()).error || message;
      } catch {
        // not JSON
      }
      if (res.status === 401) message = 'Your session has expired. Sign in again.';
      if (res.status === 403) message = 'You do not have access to this folder or action.';
      throw new Error(message);
    }
    return res;
  }

  /* ---------- paths ---------- */

  function segmentsOf(href) {
    return String(href)
      .replace(DAV_PREFIX, '')
      .split('/')
      .filter(Boolean)
      .map((s) => {
        try {
          return decodeURIComponent(s);
        } catch {
          return s;
        }
      });
  }

  const enc = (segs) => segs.map(encodeURIComponent).join('/');
  const sameSegs = (a, b) => a.length === b.length && a.every((s, i) => s === b[i]);
  const extOf = (name) => (name.includes('.') ? name.split('.').pop().toLowerCase() : '');

  /* ---------- listing ---------- */

  async function open(segs = [], { force = false } = {}) {
    error = '';
    query = '';
    newFolderOpen = false;
    const key = enc(segs) || '/';
    if (!force && cache.has(key)) {
      items = cache.get(key);
      current = segs;
      loading = false;
      return;
    }
    loading = true;
    try {
      const folderParam = segs.length ? `?folder=${encodeURIComponent(enc(segs))}` : '';
      const data = await (await api(`/api/nextcloud/files${folderParam}`)).json();
      const all = [
        ...(data.folders || []).map((f) => ({ ...f, isDir: true, segs: segmentsOf(f.path) })),
        ...(data.files || []).map((f) => ({ ...f, isDir: false, segs: segmentsOf(f.path) })),
      ];
      // The worker lists two levels: keep direct children, count what is inside each folder
      const children = all.filter((it) => sameSegs(it.segs.slice(0, -1), segs));
      for (const folder of children.filter((it) => it.isDir)) {
        folder.count = all.filter((it) => sameSegs(it.segs.slice(0, -1), folder.segs)).length;
      }
      cache.set(key, children);
      items = children;
      current = segs;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function refresh() {
    cache.clear();
    open(current, { force: true });
  }

  const visible = $derived.by(() => {
    const q = query.trim().toLowerCase();
    const list = q ? items.filter((it) => it.name.toLowerCase().includes(q)) : [...items];
    const dir = sortAsc ? 1 : -1;
    return list.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      if (sortKey === 'size') return dir * ((a.size ?? a.count ?? 0) - (b.size ?? b.count ?? 0));
      if (sortKey === 'modified')
        return dir * String(a.modified ?? '').localeCompare(String(b.modified ?? ''));
      return dir * a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
  });

  function sortBy(key) {
    if (sortKey === key) sortAsc = !sortAsc;
    else {
      sortKey = key;
      sortAsc = key === 'name';
    }
  }

  /* ---------- formatting ---------- */

  function formatSize(item) {
    if (item.isDir) return item.count === undefined ? '' : `${item.count} item${item.count === 1 ? '' : 's'}`;
    const n = item.size;
    if (n === undefined) return '';
    if (n < 1024) return `${n} B`;
    if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
    if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
    return `${(n / 1024 ** 3).toFixed(1)} GB`;
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function iconFor(item) {
    if (item.isDir) return 'folder';
    const ext = extOf(item.name);
    if (IMAGE_TYPES.includes(ext)) return 'image';
    if (ext === 'pdf') return 'picture_as_pdf';
    if (OFFICE_TYPES.includes(ext)) return 'article';
    if (TEXT_TYPES.includes(ext)) return 'description';
    if (['zip', 'gz', 'tar', '7z'].includes(ext)) return 'folder_zip';
    return 'draft';
  }

  function say(message) {
    notice = message;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => (notice = ''), 4000);
  }

  /* ---------- files ---------- */

  async function fetchBlob(item) {
    const res = await api(`/api/nextcloud/download?inline=1&file=${encodeURIComponent(enc(item.segs))}`);
    return res.blob();
  }

  async function download(item) {
    busy = `Downloading ${item.name}…`;
    try {
      const url = URL.createObjectURL(await fetchBlob(item));
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      error = err.message;
    } finally {
      busy = '';
    }
  }

  async function openItem(item) {
    if (item.isDir) {
      open(item.segs);
      return;
    }
    const ext = extOf(item.name);
    const path = enc(item.segs);
    if (IMAGE_TYPES.includes(ext) || ext === 'pdf' || TEXT_TYPES.includes(ext)) {
      busy = `Opening ${item.name}…`;
      try {
        const blob = await fetchBlob(item);
        if (TEXT_TYPES.includes(ext)) {
          editorText = await blob.text();
          preview = { name: item.name, kind: 'text', path, text: editorText };
        } else {
          const typed = ext === 'pdf' ? new Blob([blob], { type: 'application/pdf' }) : blob;
          preview = { name: item.name, kind: ext === 'pdf' ? 'pdf' : 'image', path, url: URL.createObjectURL(typed) };
        }
      } catch (err) {
        error = err.message;
      } finally {
        busy = '';
      }
      return;
    }
    if (OFFICE_TYPES.includes(ext) && canWrite) {
      // Office files open in Nextcloud (share link, admins only on the worker side)
      busy = `Opening ${item.name} in Nextcloud…`;
      const tab = window.open('', '_blank');
      try {
        const data = await (await api(`/api/nextcloud/share?file=${encodeURIComponent(path)}`)).json();
        if (tab && data?.url) tab.location.href = data.url;
        else throw new Error('No share link returned');
      } catch {
        tab?.close();
        await download(item);
      } finally {
        busy = '';
      }
      return;
    }
    download(item);
  }

  function closePreview() {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    preview = null;
    editorText = '';
  }

  async function saveText() {
    if (!preview) return;
    saving = true;
    try {
      const segs = segmentsOf(preview.path);
      const name = segs.pop();
      const form = new FormData();
      form.append('file', new File([editorText], name, { type: 'text/plain' }));
      form.append('folder', enc(segs));
      await api('/api/nextcloud/upload', { method: 'POST', body: form });
      say(`Saved ${name}`);
      closePreview();
      refresh();
    } catch (err) {
      error = err.message;
    } finally {
      saving = false;
    }
  }

  /* ---------- write actions (admins) ---------- */

  async function upload(fileList) {
    const list = [...(fileList || [])];
    if (!list.length || !canWrite) return;
    if (!current.length) {
      error = 'Open a group folder first, files cannot be uploaded at the top level.';
      return;
    }
    const existing = new Set(items.filter((it) => !it.isDir).map((it) => it.name));
    const clashes = list.filter((f) => existing.has(f.name)).map((f) => f.name);
    if (clashes.length && !confirm(`Replace ${clashes.length} existing file(s)?\n\n${clashes.join('\n')}`)) return;

    error = '';
    let done = 0;
    try {
      for (const file of list) {
        busy = `Uploading ${done + 1}/${list.length}: ${file.name}`;
        const form = new FormData();
        form.append('file', file);
        form.append('folder', enc(current));
        await api('/api/nextcloud/upload', { method: 'POST', body: form });
        done += 1;
      }
      say(`Uploaded ${done} file${done === 1 ? '' : 's'}`);
    } catch (err) {
      error = `${err.message} (${done}/${list.length} uploaded)`;
    } finally {
      busy = '';
      if (fileInput) fileInput.value = '';
      refresh();
    }
  }

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    if (/[\\/]/.test(name)) {
      error = 'A folder name cannot contain "/".';
      return;
    }
    busy = 'Creating folder…';
    try {
      await api('/api/nextcloud/create-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: enc([...current, name]) }),
      });
      newFolderName = '';
      newFolderOpen = false;
      say(`Created folder ${name}`);
      refresh();
    } catch (err) {
      error = err.message;
    } finally {
      busy = '';
    }
  }

  async function remove(item) {
    const what = item.isDir ? `the folder "${item.name}" and everything in it` : `"${item.name}"`;
    if (!confirm(`Delete ${what}? This cannot be undone.`)) return;
    busy = `Deleting ${item.name}…`;
    try {
      if (item.isDir) {
        await api('/api/nextcloud/delete-folder', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: enc(item.segs) }),
        });
      } else {
        await api(`/api/nextcloud/delete-file?file=${encodeURIComponent(enc(item.segs))}`, {
          method: 'DELETE',
        });
      }
      say(`Deleted ${item.name}`);
      refresh();
    } catch (err) {
      error = err.message;
    } finally {
      busy = '';
    }
  }

  /* ---------- drag and drop ---------- */

  let dragDepth = 0;
  const canDrop = $derived(canWrite && current.length > 0);

  function onDragEnter(event) {
    if (!canDrop || !event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    dragDepth += 1;
    dragging = true;
  }

  function onDragLeave() {
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) dragging = false;
  }

  function onDrop(event) {
    if (!canDrop) return;
    event.preventDefault();
    dragDepth = 0;
    dragging = false;
    upload(event.dataTransfer?.files);
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      if (preview) closePreview();
      else if (newFolderOpen) newFolderOpen = false;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeydown);
    open([]);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', onKeydown);
    clearTimeout(noticeTimer);
    if (preview?.url) URL.revokeObjectURL(preview.url);
  });
</script>

<div
  class="nc-page"
  role="region"
  aria-label="Group documents"
  ondragenter={onDragEnter}
  ondragover={(e) => canDrop && e.preventDefault()}
  ondragleave={onDragLeave}
  ondrop={onDrop}
>
  <header class="nc-header">
    <div>
      <h1>Group documents</h1>
      <p class="nc-muted">
        Files stored on Nextcloud. Members of a working group can read their group folder.
      </p>
    </div>
  </header>

  <div class="nc-toolbar">
    <nav class="nc-crumbs" aria-label="Folder path">
      <button type="button" class="nc-crumb" class:active={!current.length} onclick={() => open([])}>
        <Icon name="home" />
        <span>All folders</span>
      </button>
      {#each current as part, i}
        <Icon name="chevron_right" />
        <button
          type="button"
          class="nc-crumb"
          class:active={i === current.length - 1}
          onclick={() => open(current.slice(0, i + 1))}
        >
          {part}
        </button>
      {/each}
    </nav>

    <div class="nc-actions">
      <label class="nc-search">
        <Icon name="search" />
        <input type="search" placeholder="Filter this folder" bind:value={query} aria-label="Filter this folder" />
      </label>
      <button type="button" class="nc-btn" onclick={refresh} title="Refresh" aria-label="Refresh">
        <Icon name="refresh" />
      </button>
      {#if canWrite && current.length}
        <button type="button" class="nc-btn" onclick={() => (newFolderOpen = !newFolderOpen)}>
          <Icon name="create_new_folder" />
          <span>New folder</span>
        </button>
        <button type="button" class="nc-btn primary" onclick={() => fileInput?.click()}>
          <Icon name="upload" />
          <span>Upload</span>
        </button>
        <input
          bind:this={fileInput}
          type="file"
          multiple
          hidden
          onchange={(e) => upload(e.currentTarget.files)}
        />
      {/if}
    </div>
  </div>

  {#if newFolderOpen}
    <form class="nc-newfolder" onsubmit={(e) => (e.preventDefault(), createFolder())}>
      <Icon name="create_new_folder" />
      <!-- svelte-ignore a11y_autofocus -->
      <input type="text" placeholder="Folder name" bind:value={newFolderName} autofocus aria-label="New folder name" />
      <button type="submit" class="nc-btn primary" disabled={!newFolderName.trim()}>Create</button>
      <button type="button" class="nc-btn" onclick={() => (newFolderOpen = false)}>Cancel</button>
    </form>
  {/if}

  {#if error}
    <div class="nc-banner error" role="alert">
      <Icon name="error" />
      <span>{error}</span>
      <button type="button" class="nc-link" onclick={() => (error = '')}>Dismiss</button>
    </div>
  {/if}
  {#if busy || notice}
    <div class="nc-banner" role="status">
      <Icon name={busy ? 'progress_activity' : 'check_circle'} />
      <span>{busy || notice}</span>
    </div>
  {/if}

  <section class="nc-table" aria-busy={loading}>
    <div class="nc-row nc-head" role="row">
      <button type="button" class="nc-col-name" onclick={() => sortBy('name')}>
        Name {sortKey === 'name' ? (sortAsc ? '↑' : '↓') : ''}
      </button>
      <button type="button" class="nc-col-size" onclick={() => sortBy('size')}>
        Size {sortKey === 'size' ? (sortAsc ? '↑' : '↓') : ''}
      </button>
      <button type="button" class="nc-col-date" onclick={() => sortBy('modified')}>
        Modified {sortKey === 'modified' ? (sortAsc ? '↑' : '↓') : ''}
      </button>
      <span class="nc-col-actions"></span>
    </div>

    {#if loading}
      {#each [1, 2, 3, 4] as _}
        <div class="nc-row nc-skeleton"><span></span></div>
      {/each}
    {:else if !visible.length}
      <div class="nc-empty">
        <Icon name={query ? 'search_off' : 'folder_open'} />
        {#if query}
          <p>Nothing matches “{query}”.</p>
        {:else if !current.length}
          <p>No group folder is available for your account.</p>
        {:else}
          <p>This folder is empty.</p>
          {#if canWrite}<p class="nc-muted">Drop files here or use Upload.</p>{/if}
        {/if}
      </div>
    {:else}
      {#each visible as item (item.path)}
        <div class="nc-row" role="row">
          <button type="button" class="nc-col-name nc-open" onclick={() => openItem(item)} title={item.name}>
            <span class="nc-icon" class:dir={item.isDir}><Icon name={iconFor(item)} /></span>
            <span class="nc-name">{item.name}</span>
          </button>
          <span class="nc-col-size nc-muted">{formatSize(item)}</span>
          <span class="nc-col-date nc-muted">{formatDate(item.modified)}</span>
          <span class="nc-col-actions">
            {#if !item.isDir}
              <button type="button" class="nc-icon-btn" title="Download" aria-label="Download {item.name}" onclick={() => download(item)}>
                <Icon name="download" />
              </button>
            {/if}
            {#if canWrite && item.segs.length > 1}
              <button type="button" class="nc-icon-btn danger" title="Delete" aria-label="Delete {item.name}" onclick={() => remove(item)}>
                <Icon name="delete" />
              </button>
            {/if}
          </span>
        </div>
      {/each}
    {/if}
  </section>

  {#if dragging}
    <div class="nc-drop" aria-hidden="true">
      <Icon name="upload" />
      <p>Drop to upload to <strong>{current.join(' / ')}</strong></p>
    </div>
  {/if}
</div>

{#if preview}
  <div class="nc-modal" role="presentation" onclick={closePreview}>
    <div
      class="nc-dialog"
      class:wide={preview.kind !== 'image'}
      role="dialog"
      aria-modal="true"
      aria-label={preview.name}
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <header class="nc-dialog-head">
        <strong title={preview.name}>{preview.name}</strong>
        <span class="nc-spacer"></span>
        {#if preview.kind === 'text' && canWrite}
          <button type="button" class="nc-btn primary" onclick={saveText} disabled={saving || editorText === preview.text}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        {/if}
        <button type="button" class="nc-icon-btn" aria-label="Close" title="Close (Esc)" onclick={closePreview}>
          <Icon name="close" />
        </button>
      </header>
      {#if preview.kind === 'image'}
        <img src={preview.url} alt={preview.name} class="nc-preview-img" />
      {:else if preview.kind === 'pdf'}
        <iframe src={preview.url} title={preview.name} class="nc-preview-frame"></iframe>
      {:else}
        <textarea class="nc-editor" bind:value={editorText} readonly={!canWrite} spellcheck="false"></textarea>
      {/if}
    </div>
  </div>
{/if}

<style>
  .nc-page {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-height: 0;
    overflow: auto;
    padding: 20px 24px 32px;
    box-sizing: border-box;
    color: var(--sui-primary-foreground-color);
  }

  h1 {
    margin: 0;
    font-size: var(--sui-font-size-x-large);
  }

  .nc-muted {
    margin: 4px 0 0;
    color: var(--sui-secondary-foreground-color);
    font-size: var(--sui-font-size-small);
  }

  .nc-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 16px;
  }

  .nc-crumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    min-width: 0;
    color: var(--sui-secondary-foreground-color);
  }

  .nc-crumb {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: 0;
    border-radius: var(--sui-control-medium-border-radius);
    padding: 4px 8px;
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;

    &:hover {
      background: var(--sui-hover-background-color);
    }

    &.active {
      color: var(--sui-primary-foreground-color);
      font-weight: var(--sui-font-weight-bold);
    }
  }

  .nc-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .nc-search {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--sui-control-border-color);
    border-radius: var(--sui-control-medium-border-radius);
    padding: 0 8px;
    background: var(--sui-textbox-background-color);
    color: var(--sui-secondary-foreground-color);

    input {
      width: 180px;
      border: 0;
      padding: 6px 0;
      background: none;
      color: var(--sui-primary-foreground-color);
      font: inherit;
      outline: none;
    }

    &:focus-within {
      border-color: var(--sui-primary-accent-color);
    }
  }

  .nc-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--sui-control-border-color);
    border-radius: var(--sui-control-medium-border-radius);
    padding: 6px 12px;
    background: var(--sui-secondary-background-color);
    color: var(--sui-primary-foreground-color);
    font: inherit;
    font-size: var(--sui-font-size-small);
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--sui-hover-background-color);
    }

    &.primary {
      border-color: var(--sui-primary-accent-color);
      background: var(--sui-primary-accent-color);
      color: var(--sui-primary-accent-color-inverted, #fff);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
    }
  }

  .nc-newfolder {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--sui-secondary-border-color);
    border-radius: var(--sui-control-large-border-radius);
    padding: 8px 12px;
    background: var(--sui-secondary-background-color);

    input {
      flex: 1;
      min-width: 160px;
      border: 1px solid var(--sui-control-border-color);
      border-radius: var(--sui-control-medium-border-radius);
      padding: 6px 8px;
      background: var(--sui-textbox-background-color);
      color: var(--sui-primary-foreground-color);
      font: inherit;
    }
  }

  .nc-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--sui-secondary-border-color);
    border-radius: var(--sui-control-medium-border-radius);
    padding: 8px 12px;
    background: var(--sui-secondary-background-color);
    font-size: var(--sui-font-size-small);

    span {
      flex: 1;
    }

    &.error {
      border-color: var(--sui-error-border-color);
      color: var(--sui-error-foreground-color);
    }
  }

  .nc-link {
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-decoration: underline;
    cursor: pointer;
  }

  .nc-table {
    border: 1px solid var(--sui-secondary-border-color);
    border-radius: var(--sui-control-large-border-radius);
    overflow: hidden;
    background: var(--sui-primary-background-color);
  }

  .nc-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 100px 120px 84px;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 8px;
    border-top: 1px solid var(--sui-secondary-border-color);

    &:first-child {
      border-top: 0;
    }

    &:not(.nc-head):hover {
      background: var(--sui-hover-background-color);
    }
  }

  .nc-head {
    min-height: 36px;
    background: var(--sui-secondary-background-color);
    font-size: var(--sui-font-size-small);

    button {
      border: 0;
      padding: 0 4px;
      background: none;
      color: var(--sui-secondary-foreground-color);
      font: inherit;
      font-weight: var(--sui-font-weight-bold);
      text-align: left;
      cursor: pointer;
    }
  }

  .nc-col-size,
  .nc-col-date {
    margin: 0;
    white-space: nowrap;
  }

  .nc-col-actions {
    display: flex;
    justify-content: flex-end;
    gap: 2px;
  }

  .nc-open {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    border: 0;
    padding: 8px 4px;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;

    &:hover .nc-name {
      text-decoration: underline;
    }
  }

  .nc-icon {
    display: inline-flex;
    color: var(--sui-secondary-foreground-color);

    &.dir {
      color: var(--sui-primary-accent-color);
    }
  }

  .nc-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nc-icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: var(--sui-control-medium-border-radius);
    background: none;
    color: var(--sui-secondary-foreground-color);
    cursor: pointer;

    &:hover {
      background: var(--sui-hover-background-color);
      color: var(--sui-primary-foreground-color);
    }

    &.danger:hover {
      color: var(--sui-error-foreground-color);
    }
  }

  .nc-skeleton span {
    grid-column: 1 / -1;
    height: 12px;
    width: 40%;
    border-radius: 6px;
    background: var(--sui-secondary-background-color);
  }

  .nc-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 40px 16px;
    color: var(--sui-secondary-foreground-color);
    text-align: center;

    p {
      margin: 0;
    }
  }

  .nc-drop {
    position: absolute;
    inset: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px dashed var(--sui-primary-accent-color);
    border-radius: var(--sui-control-large-border-radius);
    background: color-mix(in srgb, var(--sui-primary-background-color) 85%, transparent);
    color: var(--sui-primary-accent-color);
    font-size: var(--sui-font-size-large);
    pointer-events: none;
  }

  .nc-modal {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.55);
  }

  .nc-dialog {
    display: flex;
    flex-direction: column;
    max-width: min(90vw, 1000px);
    max-height: 90vh;
    border-radius: var(--sui-control-large-border-radius);
    overflow: hidden;
    background: var(--sui-primary-background-color);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);

    &.wide {
      width: min(90vw, 1000px);
      height: 90vh;
    }
  }

  .nc-dialog-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 8px 8px 16px;
    border-bottom: 1px solid var(--sui-secondary-border-color);

    strong {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .nc-spacer {
    flex: 1;
  }

  .nc-preview-img {
    display: block;
    max-width: 100%;
    max-height: calc(90vh - 52px);
    object-fit: contain;
  }

  .nc-preview-frame {
    flex: 1;
    width: 100%;
    border: 0;
  }

  .nc-editor {
    flex: 1;
    width: 100%;
    box-sizing: border-box;
    border: 0;
    padding: 16px;
    resize: none;
    background: var(--sui-textbox-background-color);
    color: var(--sui-primary-foreground-color);
    font-family: var(--sui-font-family-monospace);
    font-size: 13px;
    line-height: 1.5;
    outline: none;
  }

  @media (width < 768px) {
    .nc-page {
      padding: 16px;
    }

    .nc-row {
      grid-template-columns: minmax(0, 1fr) 72px;
    }

    .nc-col-size,
    .nc-col-date {
      display: none;
    }

    .nc-search input {
      width: 120px;
    }
  }
</style>
