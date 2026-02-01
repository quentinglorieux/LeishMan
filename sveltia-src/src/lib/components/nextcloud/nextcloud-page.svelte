<script>
  import { writable } from "svelte/store";
  import { onMount, onDestroy } from "svelte";
  import { cmsConfig } from "$lib/services/config";

  const files = writable([]);
  const folders = writable([]);
  const currentFolder = writable("");
  const loading = writable(true);
  const error = writable(null);
  const newFolderName = writable(""); // Store new folder name
  const previewFile = writable(null);
  const loadingPreview = writable(false); //  Track loading state
  const breadcrumbParts = $derived($currentFolder.split("/").filter(Boolean));
  let editorOpen = $state(false);
  let editorContent = $state("");
  let editorFilePath = $state("");
  let editorFileType = $state("");
  let editorError = $state("");
  let editorSaving = $state(false);

  function encodePathOnce(p) {
    try {
      return encodeURI(decodeURI(p)); // decode if already encoded once
    } catch {
      return encodeURI(p);
    }
  }

  const listCache = new Map();

  function getWorkerBase() {
    return (
      $cmsConfig?.sveltia?.nextcloudWorkerBase ||
      "https://nextcloud-leishman.quentin-glorieux.workers.dev"
    );
  }

  function getWorkerHeaders() {
    const headers = {};
    const cfg = $cmsConfig?.sveltia?.nextcloudAuth || {};
    if (cfg.headerName && cfg.token) {
      headers[cfg.headerName] = cfg.token;
    } else if (cfg.token) {
      headers["X-Worker-Token"] = cfg.token;
    }
    return headers;
  }

  function getNextcloudHeaders() {
    const headers = getWorkerHeaders();
    const storedGroups =
      JSON.parse(localStorage.getItem("sveltia-cms.userGroups")) || [];
    if (storedGroups.length) {
      headers["X-User-Groups"] = storedGroups.join(",");
    }
    return headers;
  }

  async function fetchNextcloudFiles(folder = "", { force = false } = {}) {
    loading.set(true);
    error.set(null);

    let cleanFolder = folder
      .replace(/^\/?remote.php\/dav\/files\/quentin\//, "") // Remove WebDAV part
      .replace(/\/$/, "") // Remove trailing slashes
      .trim();

    const folderParam = cleanFolder
      ? `?folder=${encodeURIComponent(cleanFolder)}`
      : "";

    const cacheKey = cleanFolder || "__root__";
    if (!force && listCache.has(cacheKey)) {
      const cached = listCache.get(cacheKey);
      files.set(cached.files);
      folders.set(cached.folders);
      currentFolder.set(cleanFolder);
      loading.set(false);
      return;
    }

    try {
      const workerBase = getWorkerBase();
      const response = await fetch(
        `${workerBase}/api/nextcloud/files${folderParam}`,
        { method: "GET", headers: getWorkerHeaders() }
      );

      if (!response.ok)
        throw new Error(`Nextcloud access failed: ${response.statusText}`);

      const data = await response.json();

      const storedGroups =
        JSON.parse(localStorage.getItem("sveltia-cms.userGroups")) || [];

      const filteredFolders = data.folders.filter((folder) =>
        storedGroups.some((group) => folder.path.includes(group))
      );

      const filteredFiles = data.files.filter((file) =>
        filteredFolders.some((folder) => file.path.startsWith(folder.path))
      );

      files.set(filteredFiles);
      folders.set(filteredFolders);
      currentFolder.set(cleanFolder);
      listCache.set(cacheKey, { files: filteredFiles, folders: filteredFolders });
    } catch (err) {
      console.error("Nextcloud Fetch Error:", err);
      error.set(err.message);
    } finally {
      loading.set(false);
    }
  }

  function goUpOneLevel() {
    let pathArray = $currentFolder.split("/").filter(Boolean);

    if (pathArray.length === 0) {
      fetchNextcloudFiles("");
      return;
    }

    pathArray.pop();
    const newPath = pathArray.join("/");
    if (!newPath || newPath === "remote.php/dav/files/quentin") {
      console.log("🔼 Returning to Root Folder");
      fetchNextcloudFiles("");
    } else {
      console.log("🔼 Going up to:", newPath);
      fetchNextcloudFiles(newPath);
    }
  }

  //  Upload File
  async function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    loading.set(true);
    error.set(null);

    let cleanFolder = $currentFolder
      .replace(/^\/?remote.php\/dav\/files\/quentin\/?/, "") // Remove WebDAV prefix
      .replace(/^\/+|\/+$/g, "") // Remove leading/trailing slashes
      .trim();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", cleanFolder || "");

    try {
      const response = await fetch(
        `${getWorkerBase()}/api/nextcloud/upload`,
        {
          method: "POST",
          body: formData,
          headers: getWorkerHeaders(),
        }
      );

      if (!response.ok) throw new Error("Upload failed!");

      listCache.clear();
      fetchNextcloudFiles($currentFolder, { force: true });
    } catch (err) {
      console.error("Upload Error:", err);
      error.set(err.message);
    } finally {
      loading.set(false);
    }
  }

  //  Create Folder (Fix for Subfolders)
  async function createFolder() {
    if (!$newFolderName.trim()) return;

    //  Ensure correct path formatting
    const targetFolder = $currentFolder
      ? `${$currentFolder}/${$newFolderName.trim()}`
      : $newFolderName.trim();

    loading.set(true);
    error.set(null);

    try {
      const response = await fetch(
        `${getWorkerBase()}/api/nextcloud/create-folder`,
        {
          method: "POST",
          body: JSON.stringify({ folder: targetFolder }),
          headers: { "Content-Type": "application/json", ...getWorkerHeaders() },
        }
      );

      if (!response.ok) throw new Error("Failed to create folder!");

      console.log(` Folder Created: ${targetFolder}`);
      listCache.clear();
      fetchNextcloudFiles($currentFolder, { force: true }); //  Refresh file list
      newFolderName.set(""); //  Reset input field
    } catch (err) {
      console.error("Create Folder Error:", err);
      error.set(err.message);
    } finally {
      loading.set(false);
    }
  }

  //  Delete Folder
  async function deleteFolder(folderPath) {
    if (!folderPath) return;

    const confirmDelete = confirm(
      `Are you sure you want to delete "${folderPath.split("/").pop()}"? This action cannot be undone!`
    );
    if (!confirmDelete) return;

    loading.set(true);
    error.set(null);

    try {
      const response = await fetch(
        `${getWorkerBase()}/api/nextcloud/delete-folder`,
        {
          method: "DELETE",
          body: JSON.stringify({ folder: folderPath }),
          headers: { "Content-Type": "application/json", ...getWorkerHeaders() },
        }
      );

      if (!response.ok) throw new Error("Failed to delete folder!");

      console.log(` Folder Deleted: ${folderPath}`);
      listCache.clear();
      fetchNextcloudFiles($currentFolder, { force: true }); //  Refresh file list
    } catch (err) {
      console.error("Delete Folder Error:", err);
      error.set(err.message);
    } finally {
      loading.set(false);
    }
  }

  //  Delete File
  async function deleteFile(filePath) {
    if (!filePath) return;

    const confirmDelete = confirm(
      `🚨 Are you sure you want to delete "${filePath.split("/").pop()}"?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${getWorkerBase()}/api/nextcloud/delete-file?file=${encodePathOnce(filePath)}`,
        { method: "DELETE", headers: getWorkerHeaders() }
      );

      if (!response.ok) throw new Error("File deletion failed!");

      console.log(" File Deleted:", filePath);
      listCache.clear();
      fetchNextcloudFiles($currentFolder, { force: true }); //  Refresh file list
    } catch (err) {
      console.error("Delete File Error:", err);
      error.set(err.message);
    }
  }

  //  Download File Function
  function downloadFile(filePath) {
    if (!filePath) return;
    console.log("⬇️ Downloading:", filePath);

    const downloadURL = `${getWorkerBase()}/api/nextcloud/download?file=${encodePathOnce(filePath)}`;

    window.open(downloadURL, "_blank");
  }

  async function openPreview(filePath) {
    const fileType = filePath.split(".").pop().toLowerCase();
    const previewableTypes = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "pdf",
      "md",
      "docx",
      "odt",
      "tex",
      "txt",
      "ods"
    ];
    const editableTextTypes = ["txt", "md", "tex"];
    const officeTypes = ["odt", "ods", "docx"];

    let previewUrl = `${getWorkerBase()}/api/nextcloud/download?file=${encodePathOnce(filePath)}`;

    if (!previewableTypes.includes(fileType)) {
      alert("Preview not supported for this file type.");
      return;
    }

    loadingPreview.set(true); //  Start loading animation

    if (editableTextTypes.includes(fileType)) {
      try {
        const response = await fetch(previewUrl, { headers: getWorkerHeaders() });
        if (!response.ok) throw new Error("Failed to load file.");
        editorContent = await response.text();
        editorFilePath = filePath;
        editorFileType = fileType;
        editorOpen = true;
      } catch (err) {
        console.error("Editor load error:", err);
        alert("Failed to load file for editing.");
      } finally {
        loadingPreview.set(false);
      }
      return;
    }

    if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
      //  Show images inside the modal
      previewFile.set({ url: previewUrl, type: `image/${fileType}` });
      loadingPreview.set(false);
    } else if (officeTypes.includes(fileType)) {
      try {
        const shareUrl = `${getWorkerBase()}/api/nextcloud/share?file=${encodePathOnce(filePath)}`;
        const response = await fetch(shareUrl, { headers: getNextcloudHeaders() });
        const data = await response.json();
        if (data?.url) {
          previewFile.set({ url: data.url, type: "office" });
        } else {
          window.open(previewUrl, "_blank");
        }
      } catch (err) {
        console.error("Error fetching share link:", err);
        window.open(previewUrl, "_blank");
      } finally {
        loadingPreview.set(false);
      }
    } else {
      window.open(previewUrl, "_blank");
      loadingPreview.set(false);
      // console.log("🔹 Sending user groups for preview:", storedGroups);
      //  Fetch the Nextcloud Share Link for PDFs, Markdown, and DOCX
      try {


        // const response = await fetch(
        //   `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/share?file=${encodePathOnce(filePath)}`,
        //   {
        //     method: "GET",
        //     headers: {
        //       "X-User-Groups": storedGroups.join(","), //  Send user groups
        //     },
        //   }
        // );
        // const data = await response.json();

        // if (data.url) {
        //   if (
        //     fileType === "pdf" ||
        //     fileType === "md" ||
        //     fileType === "docx" ||
        //     fileType === "odt"
        //   ) {
        //     let finalUrl = data.url;
        //     if (fileType === "docx") {
        //       // finalUrl = data.url.replace('/s/', '/apps/onlyoffice/s/');
        //     }
        //     //  Open PDF, MD, DOCX in a new tab
        //     window.open(finalUrl, "_blank");
        //   }
        // } else {
          
        //  alert("Unable to fetch Nextcloud preview.");
        // }
      } catch (err) {
        console.error("Error fetching share link:", err);
        alert("Failed to load preview.");
      } finally {
        loadingPreview.set(false);
      }
    }
  }

  async function saveEditedFile() {
    if (!editorFilePath) return;
    editorSaving = true;
    editorError = "";

    const parts = editorFilePath.split("/");
    const filename = parts.pop() || "file.txt";
    const folder = parts.join("/");
    const mimeType =
      editorFileType === "md"
        ? "text/markdown"
        : editorFileType === "tex"
          ? "text/plain"
          : "text/plain";

    const file = new File([editorContent], filename, { type: mimeType });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch(`${getWorkerBase()}/api/nextcloud/upload`, {
        method: "POST",
        body: formData,
        headers: getWorkerHeaders(),
      });

      if (!response.ok) throw new Error("Save failed.");

      listCache.clear();
      await fetchNextcloudFiles($currentFolder, { force: true });
      closeEditor();
    } catch (err) {
      console.error("Save error:", err);
      editorError = "Failed to save changes.";
    } finally {
      editorSaving = false;
    }
  }

  function closePreview() {
    previewFile.set(null);
    loadingPreview.set(false); //  Reset loading state
  }

  function closeEditor() {
    editorOpen = false;
    editorContent = "";
    editorFilePath = "";
    editorFileType = "";
    editorError = "";
    editorSaving = false;
  }

  //  Close preview when pressing Escape
  function handleKeydown(event) {
    if (event.key === "Escape") {
      closePreview();
      closeEditor();
    }
  }

  function handleRowKeydown(event, path) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPreview(path);
    }
  }

  function handleOverlayKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      closePreview();
    }
  }

  function handleEditorOverlayKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      closeEditor();
    }
  }

  //  Add event listener when the component mounts
  onMount(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  //  Remove event listener when the component is destroyed
  onDestroy(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
  onMount(() => fetchNextcloudFiles());
</script>

<div class="nc-page">
  <header class="nc-header">
    <div class="nc-title">
      <h1>Nextcloud Files</h1>
      <p class="nc-subtitle">Secure workspace for your project documents</p>
    </div>
    <div class="nc-actions">
      <label class="nc-button primary">
        Upload
        <input type="file" onchange={uploadFile} hidden />
      </label>
      <button class="nc-button ghost" onclick={() => fetchNextcloudFiles("")}>
        Root
      </button>
      <button class="nc-button" onclick={goUpOneLevel}>Up</button>
    </div>
  </header>

  <div class="nc-body">
    <aside class="nc-sidebar">
      <div class="nc-sidebar-header">
        <h2>Folders</h2>
        <p>Browse and manage directories</p>
      </div>

      <div class="nc-folder-list">
        {#if $loading}
          <div class="nc-muted">Loading folders…</div>
        {:else if $error}
          <div class="nc-error">{$error}</div>
        {:else if !$folders.length}
          <div class="nc-muted">No folders available.</div>
        {:else}
          {#each $folders as folder}
            <div
              class="nc-folder-row"
              style="padding-left: {(folder.depth - 1) * 14}px;"
            >
              <button
                class="nc-folder-button"
                onclick={() => fetchNextcloudFiles(folder.path)}
              >
                <span class="nc-icon">📁</span>
                <span class="nc-name">{folder.name}</span>
              </button>
              <button
                class="nc-icon-button danger"
                aria-label="Delete folder"
                onclick={() => deleteFolder(folder.path)}
              >
                🗑️
              </button>
            </div>
          {/each}
        {/if}
      </div>

      <div class="nc-create">
        <label class="nc-label" for="nc-new-folder">Create folder</label>
        <input
          id="nc-new-folder"
          class="nc-input"
          type="text"
          bind:value={$newFolderName}
          placeholder="New folder name"
        />
        <button class="nc-button primary" onclick={createFolder}>
          Create
        </button>
      </div>
    </aside>

    <section class="nc-content">
      <div class="nc-toolbar">
        <div class="nc-breadcrumb">
          <button class="nc-crumb" onclick={() => fetchNextcloudFiles("")}>
            Root
          </button>
          {#each breadcrumbParts as part, i}
            <span class="nc-sep">/</span>
            <button
              class="nc-crumb"
              onclick={() => fetchNextcloudFiles(breadcrumbParts.slice(0, i + 1).join("/"))}
            >
              {part}
            </button>
          {/each}
        </div>
        <div class="nc-stats">
          <span>{$folders.length} folders</span>
          <span>{$files.length} files</span>
        </div>
      </div>

      {#if $loading}
        <div class="nc-state">Loading files…</div>
      {:else if $error}
        <div class="nc-state error">{$error}</div>
      {:else if !$files.length}
        <div class="nc-state">No files in this folder yet.</div>
      {/if}

      <div class="nc-list">
        {#each $files as file}
          <div
            class="nc-row"
            role="button"
            tabindex="0"
            onclick={() => openPreview(file.path)}
            onkeydown={(event) => handleRowKeydown(event, file.path)}
          >
            <div class="nc-row-main">
              <span class="nc-icon">📄</span>
              <span class="nc-name">{file.name}</span>
            </div>
            <div class="nc-row-actions">
              <button
                class="nc-icon-button"
                onclick={(event) => {
                  event.stopPropagation();
                  downloadFile(file.path);
                }}
              >
                Download
              </button>
              <button
                class="nc-icon-button danger"
                onclick={(event) => {
                  event.stopPropagation();
                  deleteFile(file.path);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>

<!-- File Preview Modal -->
{#if $previewFile}
  <div
    class="preview-modal"
    class:visible={$previewFile}
    role="button"
    tabindex="0"
    onclick={closePreview}
    onkeydown={handleOverlayKeydown}
  >
    <div
      class="preview-content"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <button class="close-preview" onclick={closePreview}>✖ Close</button>

      {#if $loadingPreview}
        <p class="loading-preview">⏳ Loading preview...</p>
      {:else if $previewFile.type.startsWith("image/")}
        <img src={$previewFile.url} alt="Preview" class="preview-image" />
      {:else if $previewFile.type === "application/pdf"}
        <iframe
          class="preview-pdf"
          src={$previewFile.url}
          frameborder="0"
          title="PDF preview"
        ></iframe>
      {:else if $previewFile.type === "office"}
        <iframe
          class="preview-docx"
          src={$previewFile.url}
          frameborder="0"
          title="Office editor"
        ></iframe>
      {:else if $previewFile.type === "markdown"}
        <iframe
          class="preview-markdown"
          src={$previewFile.url}
          frameborder="0"
          title="Markdown preview"
        ></iframe>
      {:else if $previewFile.type === "docx"}
        <iframe
          class="preview-docx"
          src={$previewFile.url}
          frameborder="0"
          title="DOCX preview"
        ></iframe>
      {:else if $previewFile.type === "odt"}
        <iframe
          class="preview-docx"
          src={$previewFile.url}
          frameborder="0"
          title="ODT preview"
        ></iframe>
      {:else}
        <p>
          File preview not available.
          <a href={$previewFile.url} target="_blank" rel="noreferrer">Download it</a>.
        </p>
      {/if}
    </div>
  </div>
{/if}

{#if editorOpen}
  <div
    class="preview-modal"
    class:visible={editorOpen}
    role="button"
    tabindex="0"
    onclick={closeEditor}
    onkeydown={handleEditorOverlayKeydown}
  >
    <div
      class="preview-content editor"
      role="dialog"
      aria-modal="true"
      tabindex="0"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <div class="editor-header">
        <strong>Editing {editorFilePath.split("/").pop()}</strong>
      </div>
      {#if editorError}
        <p class="nc-error">{editorError}</p>
      {/if}
      <textarea class="nc-editor" bind:value={editorContent}></textarea>
      <div class="editor-actions">
        <button class="nc-button ghost" onclick={closeEditor} disabled={editorSaving}>
          Cancel
        </button>
        <button class="nc-button primary" onclick={saveEditedFile} disabled={editorSaving}>
          {editorSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    --nc-bg: linear-gradient(140deg, #f6f4f1 0%, #eef2f3 100%);
    --nc-panel: #ffffff;
    --nc-ink: #1c1f1e;
    --nc-muted: #5b6a65;
    --nc-border: #e1e6e4;
    --nc-accent: #1f8f78;
    --nc-accent-strong: #16755f;
    --nc-danger: #b3261e;
    --nc-shadow: 0 12px 24px rgba(30, 40, 36, 0.08);
  }

  .nc-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100vh;
    padding: 20px 24px 24px;
    background: var(--nc-bg);
    color: var(--nc-ink);
  }

  .nc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .nc-title h1 {
    margin: 0;
    font-size: 24px;
    letter-spacing: -0.02em;
  }

  .nc-subtitle {
    margin: 4px 0 0;
    color: var(--nc-muted);
    font-size: 14px;
  }

  .nc-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .nc-button {
    border: 1px solid var(--nc-border);
    background: var(--nc-panel);
    color: var(--nc-ink);
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 14px;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease, border 0.12s ease;
  }

  .nc-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--nc-shadow);
  }

  .nc-button.primary {
    background: var(--nc-accent);
    color: white;
    border-color: transparent;
  }

  .nc-button.primary:hover {
    background: var(--nc-accent-strong);
  }

  .nc-button.ghost {
    background: transparent;
  }

  .nc-body {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 16px;
    flex: 1;
    min-height: 0;
  }

  .nc-sidebar,
  .nc-content {
    background: var(--nc-panel);
    border: 1px solid var(--nc-border);
    border-radius: 16px;
    box-shadow: var(--nc-shadow);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .nc-sidebar {
    padding: 16px;
  }

  .nc-sidebar-header h2 {
    margin: 0;
    font-size: 18px;
  }

  .nc-sidebar-header p {
    margin: 4px 0 12px;
    color: var(--nc-muted);
    font-size: 13px;
  }

  .nc-folder-list {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 6px;
  }

  .nc-folder-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .nc-folder-button {
    display: flex;
    align-items: center;
    gap: 8px;
    border: none;
    background: transparent;
    color: var(--nc-ink);
    text-align: left;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 8px;
    flex: 1;
  }

  .nc-folder-button:hover {
    background: #f1f5f4;
  }

  .nc-icon {
    font-size: 14px;
  }

  .nc-name {
    font-size: 14px;
  }

  .nc-icon-button {
    border: 1px solid var(--nc-border);
    background: white;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    cursor: pointer;
    color: var(--nc-ink);
  }

  .nc-icon-button.danger {
    color: var(--nc-danger);
    border-color: rgba(179, 38, 30, 0.2);
  }

  .nc-icon-button:hover {
    background: #f3f6f5;
  }

  .nc-create {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--nc-border);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .nc-label {
    font-size: 12px;
    color: var(--nc-muted);
  }

  .nc-input {
    border-radius: 10px;
    border: 1px solid var(--nc-border);
    padding: 8px 10px;
    font-size: 14px;
  }

  .nc-content {
    padding: 16px;
    gap: 12px;
  }

  .nc-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--nc-border);
    padding-bottom: 12px;
  }

  .nc-breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .nc-crumb {
    border: none;
    background: none;
    color: var(--nc-ink);
    font-weight: 600;
    cursor: pointer;
  }

  .nc-crumb:hover {
    color: var(--nc-accent);
  }

  .nc-sep {
    color: var(--nc-muted);
  }

  .nc-stats {
    display: flex;
    gap: 12px;
    color: var(--nc-muted);
    font-size: 12px;
  }

  .nc-state {
    padding: 14px;
    border-radius: 12px;
    background: #f3f6f5;
    color: var(--nc-muted);
    font-size: 14px;
  }

  .nc-state.error {
    background: rgba(179, 38, 30, 0.08);
    color: var(--nc-danger);
  }

  .nc-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
  }

  .nc-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid var(--nc-border);
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  .nc-row:hover {
    transform: translateY(-1px);
    box-shadow: var(--nc-shadow);
  }

  .nc-row-main {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nc-row-actions {
    display: flex;
    gap: 8px;
  }

  .nc-muted {
    color: var(--nc-muted);
    font-size: 13px;
  }

  .nc-error {
    color: var(--nc-danger);
    font-size: 13px;
  }

  .preview-modal {
    position: fixed;
    inset: 0;
    background: rgba(18, 20, 19, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease;
  }

  .preview-modal.visible {
    opacity: 1;
    visibility: visible;
  }

  .preview-content {
    background: white;
    border-radius: 16px;
    padding: 20px;
    max-width: min(900px, 90vw);
    max-height: 82vh;
    box-shadow: var(--nc-shadow);
    position: relative;
  }

  .preview-content.editor {
    width: min(900px, 90vw);
  }

  .editor-header {
    margin-bottom: 12px;
  }

  .nc-editor {
    width: 100%;
    height: 55vh;
    border-radius: 12px;
    border: 1px solid var(--nc-border);
    padding: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 14px;
    color: var(--nc-ink);
    background: #fbfbfb;
  }

  .editor-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 12px;
  }

  .preview-image {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }

  .preview-pdf,
  .preview-markdown,
  .preview-docx {
    width: min(860px, 85vw);
    height: 70vh;
  }

  .close-preview {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    background: var(--nc-danger);
    color: white;
    padding: 6px 10px;
    border-radius: 999px;
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .nc-body {
      grid-template-columns: 1fr;
    }

    .nc-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
