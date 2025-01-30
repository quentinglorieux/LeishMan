<script>
  import { writable } from "svelte/store";
  import { onMount } from "svelte";

  // ✅ Stores for UI state
  const files = writable([]);
  const folders = writable([]);
  const currentFolder = writable(""); // Track current folder path
  const loading = writable(true);
  const error = writable(null);

  async function fetchNextcloudFiles(folder = "") {
    loading.set(true);
    error.set(null);

    let cleanFolder = folder
      .replace(/^remote.php\/dav\/files\/quentin\//, "")
      .trim();

    const folderParam = cleanFolder
      ? `?folder=${encodeURIComponent(cleanFolder)}`
      : "";

    try {
      const response = await fetch(
        `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/files${folderParam}`,
        { method: "GET" }
      );

      if (!response.ok)
        throw new Error(`Nextcloud access failed: ${response.statusText}`);

      const data = await response.json();
      files.set(data.files);
      folders.set(data.folders);
      currentFolder.set(cleanFolder);
    } catch (err) {
      console.error("❌ Nextcloud Fetch Error:", err);
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

  // Download File
  function downloadFile(filePath) {
    const downloadURL = `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/download?file=${encodeURIComponent(filePath)}`;
    window.open(downloadURL, "_blank");
  }

  // Fetch files on mount
  onMount(() => fetchNextcloudFiles());
</script>

<!-- Nextcloud File Browser UI -->
<div class="file-browser">
  <h2>📂 Leishman Files</h2>

  {#if $loading}
    <p class="loading">⏳ Loading files...</p>
  {:else if $error}
    <p class="error">❌ Error: {$error}</p>
  {:else}
    <div class="breadcrumb">
      {#if $currentFolder}
        <button class="breadcrumb-button" on:click={goUpOneLevel}
          >⬅️ Go Back</button
        >
      {/if}
    </div>

    <div class="file-container">
      <!-- Folder List -->
      {#each $folders as folder}
      <button
      class="folder-item"
      type="button"
      on:click={() => fetchNextcloudFiles(folder.path)}
      on:keypress={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          fetchNextcloudFiles(folder.path);
        }
      }}
      aria-label="Open folder {folder.name}"
    >
      📁 {folder.name}
    </button>
      {/each}

      <!-- File List -->
      {#each $files as file}
        <div class="file-item">
          <span>📄 {file.name}</span>
          <button
            class="download-button"
            on:click={() => downloadFile(file.path)}
          >
            ⬇️ Download
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .file-browser {
    max-width: 900px;
    margin: 40px auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    font-family: "Arial", sans-serif;
  }

  h2 {
    text-align: center;
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
  }

  .breadcrumb {
    margin-bottom: 15px;
  }

  .breadcrumb-button {
    background: #007bff;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }

  .breadcrumb-button:hover {
    background: #2d93ff;
  }

  .file-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .folder-item {
    display: flex;
    align-items: center;
    /* background: #f0f8ff; */
    padding: 10px 15px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }

  .folder-item:hover {
    background: #403f3f;
  }

  .file-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border-radius: 6px;
    background: #fff9f9;
    color: #333;
    border: 1px solid #ddd;
    font-size: 16px;
    transition: background 0.2s ease-in-out;
  }

  .file-item:hover {
    background: #f9f9f9;
  }

  /* ✅ Download Button */
  .download-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    margin-left: 20px;
  }

  .download-button:hover {
    background: #0056b3;
  }

  /* ✅ Error & Loading States */
  .loading,
  .error {
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    margin-top: 10px;
  }

  .error {
    color: red;
  }
</style>
