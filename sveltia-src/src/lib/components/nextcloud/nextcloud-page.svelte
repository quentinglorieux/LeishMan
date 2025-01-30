<script>
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
  
    // ✅ Stores for UI state
    const files = writable([]);
    const loading = writable(true);
    const error = writable(null);
  
    async function fetchNextcloudFiles() {
      loading.set(true);
      error.set(null);
  
      try {
        const response = await fetch(
          "https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/files"
        );
  
        if (!response.ok) {
          throw new Error(`❌ Nextcloud access failed: ${response.statusText}`);
        }
  
        const data = await response.json();
        files.set(data.files);
      } catch (err) {
        console.error("❌ Nextcloud Fetch Error:", err);
        error.set(err.message);
      } finally {
        loading.set(false);
      }
    }
  
    // ✅ **Download File from Cloudflare Proxy**
    async function downloadFile(filePath) {
      window.open(
        `https://nextcloud-leishman.quentin-glorieux.workers.dev/api/nextcloud/download?file=${encodeURIComponent(filePath)}`,
        "_blank"
      );
    }
  
    // ✅ Fetch files on mount
    onMount(fetchNextcloudFiles);
  </script>
  
  <style>
    .file-list {
      max-width: 800px;
      margin: auto;
      padding: 20px;
    }
  
    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
  
    .file-item a {
      text-decoration: none;
      color: blue;
    }
  
    .download-button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
      border-radius: 4px;
    }
  
    .download-button:hover {
      background-color: #0056b3;
    }
  </style>
  
  <!-- ✅ Nextcloud File Browser UI -->
  <div class="file-list">
    <h2>📂 Nextcloud Files</h2>
  
    {#if $loading}
      <p>⏳ Loading files...</p>
    {:else if $error}
      <p style="color: red;">❌ Error: {$error}</p>
    {:else if $files.length === 0}
      <p>📭 No files found.</p>
    {:else}
      <ul>
        {#each $files as file}
          <li class="file-item">
            <span>📄 {file.name}</span>
            <button class="download-button" on:click={() => downloadFile(file.path)}>⬇️ Download</button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>