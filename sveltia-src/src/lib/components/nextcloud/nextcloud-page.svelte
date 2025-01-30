<script>
  import { writable } from "svelte/store";
  import { onMount } from "svelte";

  const files = writable([]);
  const folders = writable([]);
  const currentFolder = writable("");
  const loading = writable(true);
  const error = writable(null);
  const newFolderName = writable(""); // Store new folder name

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
      `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("❌ Upload failed!");

    fetchNextcloudFiles($currentFolder); 
  } catch (err) {
    console.error("❌ Upload Error:", err);
    error.set(err.message);
  } finally {
    loading.set(false);
  }
}

  //  Create Folder
  async function createFolder() {
    if (!$newFolderName) return;

    const response = await fetch(
      `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/create-folder`,
      {
        method: "POST",
        body: JSON.stringify({ folder: `${$currentFolder}/${$newFolderName}` }),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.ok) {
      fetchNextcloudFiles($currentFolder);
      newFolderName.set("");
    } else {
      error.set("❌ Failed to create folder");
    }
  }


  // ✅ Download File Function
function downloadFile(filePath) {
  if (!filePath) return;
  console.log("⬇️ Downloading:", filePath);

  const downloadURL = `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/download?file=${encodeURIComponent(filePath)}`;
  
  window.open(downloadURL, "_blank");
}
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
    <div class="controls">
      <button class="breadcrumb-button" on:click={goUpOneLevel}
        >⬅️ Go Back</button
      >

      <!--  Upload File Input -->
      <input type="file" on:change={uploadFile} />

      <!--  Create Folder Input -->
      <input class="new-folder-input"
        type="text"
        bind:value={$newFolderName}
        placeholder="New folder name"
      />
      <button on:click={createFolder}>📁 Create Folder</button>
    </div>

    <div class="file-container">
      {#each $folders as folder}
        <button
          class="folder-item"
          on:click={() => fetchNextcloudFiles(folder.path)}
        >
          📁 {folder.name}
        </button>
      {/each}

      {#each $files as file}
        <div class="file-item">
          <span>📄 {file.name}</span>
          <button
            class="download-button"
            on:click={() => downloadFile(file.path)}>⬇️ Download</button
          >
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .controls {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  input[type="text"],
  input[type="file"] {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .file-browser {
    max-width: 1200px;
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
  max-height: 600px; 
  overflow-y: auto;   
  padding-right: 5px; 
}

.file-container::-webkit-scrollbar {
  width: 6px;
}

.file-container::-webkit-scrollbar-thumb {
  background: #007bff;
  border-radius: 3px;
}

.file-container::-webkit-scrollbar-track {
  background: #f1f1f1;
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

  .new-folder-input
  {
    background: #f9f9f9;
    color: gray;
  }

  /*  Download Button */
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

  /*  Error & Loading States */
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
