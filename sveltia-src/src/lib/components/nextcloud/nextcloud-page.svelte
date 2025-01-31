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

// ✅ Create Folder (Fix for Subfolders)
async function createFolder() {
  if (!$newFolderName.trim()) return;

  // ✅ Ensure correct path formatting
  const targetFolder = $currentFolder
    ? `${$currentFolder}/${$newFolderName.trim()}`
    : $newFolderName.trim();

  loading.set(true);
  error.set(null);

  try {
    const response = await fetch(
      `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/create-folder`,
      {
        method: "POST",
        body: JSON.stringify({ folder: targetFolder }),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("❌ Failed to create folder!");

    console.log(`✅ Folder Created: ${targetFolder}`);
    fetchNextcloudFiles($currentFolder); // ✅ Refresh file list
    newFolderName.set(""); // ✅ Reset input field
  } catch (err) {
    console.error("❌ Create Folder Error:", err);
    error.set(err.message);
  } finally {
    loading.set(false);
  }
}

  // ✅ Delete Folder
async function deleteFolder(folderPath) {
  if (!folderPath) return;
  
  const confirmDelete = confirm(`⚠️ Are you sure you want to delete "${folderPath.split('/').pop()}"? This action cannot be undone!`);
  if (!confirmDelete) return;
  
  loading.set(true);
  error.set(null);

  try {
    const response = await fetch(
      `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/delete-folder`,
      {
        method: "DELETE",
        body: JSON.stringify({ folder: folderPath }),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("❌ Failed to delete folder!");

    console.log(`✅ Folder Deleted: ${folderPath}`);
    fetchNextcloudFiles($currentFolder); // ✅ Refresh file list
  } catch (err) {
    console.error("❌ Delete Folder Error:", err);
    error.set(err.message);
  } finally {
    loading.set(false);
  }
}

// ✅ Delete File
async function deleteFile(filePath) {
  if (!filePath) return;
  
  const confirmDelete = confirm(`🚨 Are you sure you want to delete "${filePath.split('/').pop()}"?`);
  if (!confirmDelete) return;


  try {
    const response = await fetch(
      `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/delete-file?file=${encodeURIComponent(filePath)}`,
      { method: "DELETE" }
    );

    if (!response.ok) throw new Error("❌ File deletion failed!");

    console.log("✅ File Deleted:", filePath);
    fetchNextcloudFiles($currentFolder); // ✅ Refresh file list
  } catch (err) {
    console.error("❌ Delete File Error:", err);
    error.set(err.message);
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

<div class="file-manager">
    <!-- 📂 Sidebar (Folders) -->
    <div class="sidebar">
      <h2>📂 Documents</h2>
      <button class="breadcrumb-button" on:click={goUpOneLevel}>⬅️ Go Back</button>
      
      <div class="folder-list">
        {#each $folders as folder}
          <div class="folder-item">
            <button class="folder-name" on:click={() => fetchNextcloudFiles(folder.path)}>
              📁 {folder.name}
            </button>
            <button class="delete-folder" on:click={() => deleteFolder(folder.path)}>🗑️</button>
          </div>
        {/each}
      </div>
  
      <!-- 📁 Create Folder (Bottom Section) -->
      <div class="create-folder">
        <input class="new-folder-input" type="text" bind:value={$newFolderName} placeholder="New folder name" />
        <button class="folder-action-button" on:click={createFolder}>📁 Create Folder</button>
      </div>
    </div>
  
    <!-- 📄 Main Content (Files + Upload) -->
    <div class="main-content">
      <div class="header">
        <h2>📄 Files</h2>
  
        <!-- 📤 Upload Section -->
        <div class="upload-container">
          <label class="upload-label">
            <input type="file" on:change={uploadFile} hidden />
            📤 Upload File
          </label>
        </div>
      </div>
  
      <div class="file-list">
        {#each $files as file}
        <div class="file-item">
          <div class="file-info" on:click={() => downloadFile(file.path)}>
            📄 <span class="file-name">{file.name}</span>
          </div>
          <button class="delete-file" on:click={() => deleteFile(file.path)}>🗑️</button>
        </div>
      {/each}
      </div>
    </div>
  </div>
  
  <style>
  /* 🌟 Full-screen layout */
  .file-manager {
    display: flex;
    height: 100vh;
    font-family: "Arial", sans-serif;
  }
  
  /* 📂 Sidebar (Folders) */
  .sidebar {
    width: 280px;
    background: #2c3e50;
    color: white;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  /* 📂 Folder List */
  .folder-list {
    flex-grow: 1;
    overflow-y: auto;
  }
  
  .folder-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    border-radius: 4px;
    background: transparent;
    color: white;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  
  .folder-item:hover {
    background: #34495e;
  }
  
  .folder-name {
    flex-grow: 1;
    text-align: left;
    background: none;
    border: none;
    color: white;
    cursor: pointer;
  }
  
  .folder-name:hover {
    /* text-decoration: underline; */
  }
  
  /* ❌ Delete Folder Button */
  .delete-folder {
    background: transparent;
    border: none;
    color: white;
    padding: 3px 7px;
    border-radius: 10px;
    cursor: pointer;
  }
  
  .delete-folder:hover {
    background: rgb(241, 221, 221);

  }
  
  /* 📁 Create Folder (Bottom Section) */
  .create-folder {
    padding-top: 10px;
    border-top: 1px solid #7f8c8d;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .new-folder-input {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background: white;
    color: black;
  }
  
  .folder-action-button {
    padding: 8px;
    border-radius: 4px;
    border: none;
    background: #16a085;
    color: white;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  
  .folder-action-button:hover {
    background: #138d75;
  }
  
  /* 📄 Main Content */
  .main-content {
    flex-grow: 1;
    padding: 20px;
    background: #ecf0f1;
    display: flex;
    flex-direction: column;
  }
  
  /* 📤 Upload Section */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  
  .upload-container {
    display: flex;
    justify-content: flex-end;
  }
  
  .upload-label {
    background: #16a085;
    padding: 8px 12px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
  }
  
  .upload-label:hover {
    background: #138d75;
  }
  
  /* 📄 File List */
  .file-list {
    flex-grow: 1;
    overflow-y: auto;
  }
  
  .file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  transition: background 0.2s ease-in-out;
  cursor: pointer;
}

.file-item:hover {
  background: #f9f9f9;
}

/* ✅ File Name Clickable */
.file-info {
  flex-grow: 1;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* ✅ Delete File Button (Same Style as Folder) */
.delete-file {
    background: transparent;
  border: none;
  padding: 9px 12px;
  border-radius: 40px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
}

.delete-file:hover {
  background: rgb(241, 221, 221);
  border-width: 1px;
  border-color: red;

}
  </style>