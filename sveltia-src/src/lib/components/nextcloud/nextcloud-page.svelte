<script>
  import { writable } from "svelte/store";
  import { onMount, onDestroy } from "svelte";

  const files = writable([]);
  const folders = writable([]);
  const currentFolder = writable("");
  const loading = writable(true);
  const error = writable(null);
  const newFolderName = writable(""); // Store new folder name
  const previewFile = writable(null);
  const loadingPreview = writable(false); //  Track loading state

  function encodePathOnce(p) {
    try {
      return encodeURI(decodeURI(p)); // decode if already encoded once
    } catch {
      return encodeURI(p);
    }
  }

  async function fetchNextcloudFiles(folder = "") {
    loading.set(true);
    error.set(null);

    let cleanFolder = folder
      .replace(/^\/?remote.php\/dav\/files\/quentin\//, "") // Remove WebDAV part
      .replace(/\/$/, "") // Remove trailing slashes
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
        `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed!");

      fetchNextcloudFiles($currentFolder);
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
        `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/create-folder`,
        {
          method: "POST",
          body: JSON.stringify({ folder: targetFolder }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to create folder!");

      console.log(` Folder Created: ${targetFolder}`);
      fetchNextcloudFiles($currentFolder); //  Refresh file list
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
        `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/delete-folder`,
        {
          method: "DELETE",
          body: JSON.stringify({ folder: folderPath }),
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to delete folder!");

      console.log(` Folder Deleted: ${folderPath}`);
      fetchNextcloudFiles($currentFolder); //  Refresh file list
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
        `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/delete-file?file=${encodePathOnce(filePath)}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("File deletion failed!");

      console.log(" File Deleted:", filePath);
      fetchNextcloudFiles($currentFolder); //  Refresh file list
    } catch (err) {
      console.error("Delete File Error:", err);
      error.set(err.message);
    }
  }

  //  Download File Function
  function downloadFile(filePath) {
    if (!filePath) return;
    console.log("⬇️ Downloading:", filePath);

    const downloadURL = `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/download?file=${encodePathOnce(filePath)}`;

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
      "tex"
    ];

    let previewUrl = `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/download?file=${encodePathOnce(filePath)}`;

    if (!previewableTypes.includes(fileType)) {
      alert("Preview not supported for this file type.");
      return;
    }

    loadingPreview.set(true); //  Start loading animation

    if (["jpg", "jpeg", "png", "gif"].includes(fileType)) {
      //  Show images inside the modal
      previewFile.set({ url: previewUrl, type: `image/${fileType}` });
      loadingPreview.set(false);
    } else {
      const storedGroups =
        JSON.parse(localStorage.getItem("sveltia-cms.userGroups")) || [];
      // console.log("🔹 Sending user groups for preview:", storedGroups);
      //  Fetch the Nextcloud Share Link for PDFs, Markdown, and DOCX
      try {
        const response = await fetch(
          `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/share?file=${encodePathOnce(filePath)}`,
          {
            method: "GET",
            headers: {
              "X-User-Groups": storedGroups.join(","), //  Send user groups
            },
          }
        );
        const data = await response.json();

        if (data.url) {
          if (
            fileType === "pdf" ||
            fileType === "md" ||
            fileType === "docx" ||
            fileType === "odt"
          ) {
            let finalUrl = data.url;
            if (fileType === "docx") {
              // finalUrl = data.url.replace('/s/', '/apps/onlyoffice/s/');
            }
            //  Open PDF, MD, DOCX in a new tab
            window.open(finalUrl, "_blank");
          }
        } else {
          alert("Unable to fetch Nextcloud preview.");
        }
      } catch (err) {
        console.error("Error fetching share link:", err);
        alert("Failed to load preview.");
      } finally {
        loadingPreview.set(false);
      }
    }
  }

  function closePreview() {
    previewFile.set(null);
    loadingPreview.set(false); //  Reset loading state
  }

  //  Close preview when pressing Escape
  function handleKeydown(event) {
    if (event.key === "Escape") {
      closePreview();
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

<div class="file-manager">
  <!-- 📂 Sidebar (Folders) -->
  <div class="sidebar">
    <h2>📂 Documents</h2>
    <!-- <button class="breadcrumb-button" on:click={goUpOneLevel}>⬅️ Go Back</button> -->
    <button class="breadcrumb-button" on:click={() => fetchNextcloudFiles("")}>
      🏠 Root
    </button>

    <div class="folder-list">
      {#each $folders as folder}
        <div
          class="folder-item"
          style="padding-left: {(folder.depth - 1) * 15}px;"
        >
          <button
            class="folder-name"
            on:click={() => fetchNextcloudFiles(folder.path)}
          >
            📁 {folder.name}
          </button>
          <button
            class="delete-folder"
            on:click={() => deleteFolder(folder.path)}>🗑️</button
          >
        </div>
      {/each}
    </div>

    <!-- 📁 Create Folder (Bottom Section) -->
    <div class="create-folder">
      <input
        class="new-folder-input"
        type="text"
        bind:value={$newFolderName}
        placeholder="New folder name"
      />
      <button class="folder-action-button" on:click={createFolder}
        >📁 Create Folder</button
      >
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
          <div class="file-info" on:click={() => openPreview(file.path)}>
            📄 <span class="file-name">{file.name}</span>
          </div>
          <button class="delete-file" on:click={() => deleteFile(file.path)}
            >🗑️</button
          >
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- File Preview Modal -->
{#if $previewFile}
  <div class="preview-modal" class:visible={$previewFile}>
    <div class="preview-content">
      <button class="close-preview" on:click={() => previewFile.set(null)}
        >✖ Close</button
      >

      {#if !loadingPreview}
        <p class="loading-preview">⏳ Loading preview...</p>
      {:else if $previewFile.type.startsWith("image/")}
        <img src={$previewFile.url} alt="Preview" class="preview-image" />
      {:else if $previewFile.type === "application/pdf"}
        <iframe class="preview-pdf" src={$previewFile.url} frameborder="0"
        ></iframe>
      {:else if $previewFile.type === "markdown"}
        <iframe class="preview-markdown" src={$previewFile.url} frameborder="0"
        ></iframe>
      {:else if $previewFile.type === "docx"}
        <iframe class="preview-docx" src={$previewFile.url} frameborder="0"
        ></iframe>
      {:else if $previewFile.type === "odt"}
        <iframe class="preview-docx" src={$previewFile.url} frameborder="0"
        ></iframe>
      {:else}
        <p>
          File preview not available. <a href={$previewFile.url} target="_blank"
            >Download it</a
          >.
        </p>
      {/if}
    </div>
  </div>
{/if}

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

  /* Delete Folder Button */
  .delete-folder {
    background: transparent;
    border: none;
    color: white;
    padding: 3px 7px;
    border-radius: 10px;
    cursor: pointer;
  }

  .delete-folder:hover {
    background: rgba(128, 128, 128, 0.245);
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

  /*  File Name Clickable */
  .file-info {
    flex-grow: 1;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }

  /*  Delete File Button (Same Style as Folder) */
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
    /* background: rgb(241, 221, 221); */
    border-width: 1px;
    border-color: red;
    background-color: #ccc;
  }

  .breadcrumb-button {
    background: #16a085;
    border: none;
    padding: 6px 6px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease-in-out;
    color: white;
  }

  .breadcrumb-button:hover {
    background: #138d75;
  }

  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .preview-modal.visible {
    visibility: visible;
    opacity: 1;
  }

  .preview-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    max-width: 80%;
    max-height: 80vh; /*  Limits height of modal */
    overflow: hidden; /*  Ensures content stays inside */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .preview-image {
    max-width: 100%;
    max-height: 70vh; /*  Prevent image from exceeding the viewport height */
    display: block;
    margin: 0 auto;
    object-fit: contain; /*  Ensures the image is fully visible inside the preview box */
  }

  .preview-pdf {
    width: 800px;
    height: 800px;
  }

  .preview-markdown {
    width: 800px;
    height: 800px;
  }

  .preview-docx {
    width: 800px;
    height: 800px;
  }

  .close-preview {
    position: absolute;
    top: 10px;
    right: 10px;
    background: red;
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
  }

  /* 🔄 Loading Spinner */
  .loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    font-weight: bold;
    color: #fff;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 20px;
    border-radius: 6px;
    z-index: 10;
  }
</style>
