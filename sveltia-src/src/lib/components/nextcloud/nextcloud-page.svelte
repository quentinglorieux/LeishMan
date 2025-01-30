<script>
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
  
    // ✅ Stores for UI state
    const files = writable([]);
    const loading = writable(true);
    const error = writable(null);
  
    // ✅ Fetch Nextcloud Credentials from LocalStorage (Set at Login)
    const username = localStorage.getItem("nextcloudUsername") || "quentin";
    const password = localStorage.getItem("nextcloudPassword") || "K7jPX-28Qdr-tPiMo-aSZas-K6Psc";
  
    async function fetchNextcloudFiles() {
      loading.set(true);
      error.set(null);
      console.log(username, password)
      try {
        const response = await fetch(
          "https://nextcloud.rubidiumweb.fr/remote.php/dav/files/" + username + "/",
          {
            method: "PROPFIND",
            headers: {
              Authorization: "Basic " + btoa(username + ":" + password),
              Depth: "1",
              "Content-Type": "application/xml",
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`Nextcloud access failed: ${response.statusText}`);
        }
  
        const textResponse = await response.text();
  
        // ✅ Parse XML response
        const parser = new DOMParser();
        const xml = parser.parseFromString(textResponse, "application/xml");
  
        // ✅ Extract file list from WebDAV response
        const fileNodes = [...xml.getElementsByTagName("d:response")].slice(1); // Skip first (root)
        const fileList = fileNodes.map((node) => {
          const href = node.getElementsByTagName("d:href")[0].textContent;
          return {
            name: decodeURIComponent(href.split("/").pop()), // Properly decode filenames
            path: href,
          };
        });
  
        files.set(fileList);
      } catch (err) {
        console.error("❌ Nextcloud Fetch Error:", err);
        error.set(err.message);
      } finally {
        loading.set(false);
      }
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
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
  
    .file-item a {
      text-decoration: none;
      color: blue;
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
            <a href="https://nextcloud.rubidiumweb.fr/remote.php/dav/files/{username}/{file.name}" target="_blank">
              📄 {file.name}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>