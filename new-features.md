# New features

## DOI Import Module

Summary of Fetching DOI Publications in Svelte

We modularized the DOI import feature by separating concerns into distinct files:

1️⃣ New Service File for DOI Fetching

📍 Path: $lib/services/contents/doiService.js
💡 Purpose: Handles API calls to fetch publication metadata from CrossRef.

Code:

```javascript
export async function fetchPublicationFromDOI(doi) {
  if (!doi.trim()) {
    return { error: "DOI cannot be empty" };
  }

  try {
    const response = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(doi)}`
    );
    if (!response.ok) {
      return { error: "DOI not found" };
    }

    const data = await response.json();
    return { data: data.message };
  } catch (error) {
    return { error: "Error fetching DOI metadata" };
  }
}
```

🛠 What this does:
• Checks if DOI is empty.
• Fetches metadata from CrossRef API.
• Returns either data (publication metadata) or an error message.

2️⃣ New Component for DOI Import UI

📍 Path: $lib/components/contents/shared/import-publi-dialog.svelte
💡 Purpose: Provides a UI dialog for entering DOI and displaying metadata.

Code:

```javascript
<script>
  import { Dialog, Button, TextInput, Spacer, Toast, Icon } from '@sveltia/ui';
  import { fetchPublicationFromDOI } from '$lib/services/contents/doiService';
  import { writable } from 'svelte/store';
  import { _ } from 'svelte-i18n';

  export let open = writable(false);
  let doi = writable('');
  let publicationData = writable(null);
  let loading = writable(false);
  let errorMessage = writable('');
  let showToast = writable(false);
  let toastMessage = writable('');

  async function handleFetchDOI() {
    loading.set(true);
    errorMessage.set('');
    publicationData.set(null);

    try {
      let result = await fetchPublicationFromDOI($doi);
      if (result.error) {
        errorMessage.set(result.error);
      } else {
        publicationData.set(result.data);
        toastMessage.set($_('doi_import_success'));
        showToast.set(true);
      }
    } catch (err) {
      errorMessage.set($_('doi_fetch_error'));
    } finally {
      loading.set(false);
    }
  }
</script>
```

```html
<Dialog bind:open title={$_('import_publication')}>
  <Text>{$_('enter_doi')}</Text>
  <TextInput bind:value={$doi} placeholder="10.1103/PhysRevLett.116.061102" />

  {#if $errorMessage}
    <p class="error">{$errorMessage}</p>
  {/if}

  {#if $publicationData}
    <div class="publication-info">
      <h3>{$publicationData.title?.[0] || $_('no_title')}</h3>
      <p><strong>{$_('authors')}:</strong> {$publicationData.author?.map(a => a.family).join(', ') || $_('unknown')}</p>
      <p><strong>{$_('journal')}:</strong> {$publicationData['container-title']?.[0] || 'N/A'}</p>
      <p><strong>{$_('year')}:</strong> {$publicationData.issued?.['date-parts']?.[0]?.[0] || 'N/A'}</p>
      <p><a href={$publicationData.URL} target="_blank">{$_('view_publisher')}</a></p>
    </div>
  {/if}

  <Spacer flex />
  <Button variant="secondary" on:click={handleFetchDOI} disabled={$loading}>
    {#if $loading} <Icon name="loader" spin /> {/if}
    {$_('fetch_metadata')}
  </Button>
  <Button variant="ghost" on:click={() => open.set(false)}>{$_('close')}</Button>
</Dialog>

{#if $showToast}
  <Toast message={$toastMessage} on:close={() => showToast.set(false)} />
{/if}

<style lang="scss">
  .error {
    color: red;
    font-weight: bold;
  }

  .publication-info {
    margin-top: 10px;
    padding: 10px;
    background: #f8f8f8;
    border-radius: 5px;
  }

  .publication-info h3 {
    margin: 0;
  }
</style>
```

🛠 What this does:
• Provides a dialog box for DOI input.
• Calls fetchPublicationFromDOI(doi) and displays metadata.
• Shows a toast message on successful import.

3️⃣ Minimal Change to Your Main File

📍 Your Main File

Code:

```javascript
<script>
  import ImportPubliDialog from '$lib/components/contents/shared/import-publi-dialog.svelte';
  import { writable } from 'svelte/store';

  let showImportDialog = writable(false);
</script>

<Button
  variant="secondary"
  label={$_('import')}
  aria-label={$_('import_entries')}
  on:click={() => showImportDialog.set(true)}
>
  <Icon name="upload" slot="startIcon" />
</Button>

<ImportPubliDialog bind:open={$showImportDialog} />
```

🛠 What this does:
• Adds an “Import” button to open the modal.
• Calls ImportPubliDialog, binding the state to showImportDialog.

Final Benefits

✔ Clean architecture: Separate concerns for fetching data and UI.
✔ Minimal modifications: Your main file stays lightweight.
✔ Reusability: doiService.js can be used elsewhere.
✔ Scalability: Future improvements (e.g., ORCID lookup) can go into doiService.js.

🚀 Now your DOI Import is fully modular, maintainable, and reusable! Let me know if you need anything else. 😊

## Login

Explanation of ORCID Login Flow for Sveltia CMS with Cloudflare Worker

🎯 Objective

We implemented ORCID authentication for users to sign in and edit files in Sveltia CMS. The authentication allows only pre-approved ORCID users to obtain a GitHub token (used to edit the repository). The whole flow is managed via a Cloudflare Worker, which: 1. Redirects users to ORCID for authentication. 2. Verifies ORCID users against a YAML admin list. 3. Issues a GitHub token for CMS access. 4. Passes the authentication result back to the frontend.

🚀 Step-by-Step Breakdown of the ORCID Login Flow

1️⃣ User Clicks “Sign in with ORCID”
• On the Sveltia CMS login page, a new login button was added:

```html
<button
  variant="primary"
  label="Sign in with ORCID"
  onclick="{signInWithOrcid}"
/>
```

    •	When clicked, it opens a pop-up for ORCID authentication:

```javascript
function signInWithOrcid() {
  const width = 600;
  const height = 800;
  const top = (window.screen.availHeight - height) / 2;
  const left = (window.screen.availWidth - width) / 2;

  window.open(
    "https://orcid-sveltia.quentin-glorieux.workers.dev/auth/orcid",
    "orcid-auth",
    `width=${width},height=${height},top=${top},left=${left}`
  );
}
```

2️⃣ Redirect to ORCID Authentication
• The Cloudflare Worker listens for "/auth/orcid" and redirects the user:

```javascript
async function handleOrcidAuth(env) {
  const csrfToken = crypto.randomUUID().replaceAll("-", "");

  const params = new URLSearchParams({
    client_id: env.ORCID_CLIENT_ID,
    response_type: "code",
    scope: "/authenticate",
    redirect_uri: `${env.BASE_URL}/auth/orcid/callback`,
  });

  return new Response("", {
    status: 302,
    headers: {
      Location: `https://orcid.org/oauth/authorize?${params.toString()}`,
      "Set-Cookie": `csrf-token=orcid_${csrfToken}; HttpOnly; Secure; Max-Age=600; Path=/; SameSite=Lax`,
    },
  });
}
```

    •	The user is redirected to ORCID’s login page.

3️⃣ ORCID Redirects Back to Cloudflare Worker
• After login, ORCID sends a code to our callback:

```javascript
async function handleOrcidCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Error: ORCID code missing.", { status: 400 });
  }

  // Exchange ORCID code for access token
  const tokenResponse = await fetch("https://orcid.org/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.ORCID_CLIENT_ID,
      client_secret: env.ORCID_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: `${env.BASE_URL}/auth/orcid/callback`,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.orcid) {
    return new Response("Error: ORCID authentication failed.", { status: 400 });
  }

  const orcidId = tokenData.orcid;
```

4️⃣ Cloudflare Worker Verifies ORCID Against Admin List
• The Cloudflare Worker checks if the ORCID ID exists in admin.yml, editor.yml, or viewer.yml:

```javascript
async function getUserRole(orcidId) {
  const roles = ["admin", "editor", "viewer"];
  const baseUrl = "https://leishman.netlify.app/data/users/";

  for (const role of roles) {
    const response = await fetch(`${baseUrl}${role}.yml`, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (response.ok) {
      const yamlText = await response.text();
      const orcids = parseYAML(yamlText);

      if (orcids.includes(orcidId)) {
        return role; //  Return the first matched role
      }
    }
  }

  return null; // ❌ Not found in any list
}
```

    •	If the ORCID ID is not found, the user is denied access.

5️⃣ If ORCID is Allowed, Send GitHub Token
• If the user is in admin.yml, editor.yml, or viewer.yml, they get a GitHub token:

```javascript
return new Response(
  `
  <script>
    window.opener.postMessage({
      backendName: "github",
      token: "${env.GITHUB_BOT_TOKEN}",
      role: "${userRole}"
    }, "*");
    window.close();
  </script>
`,
  {
    headers: { "Content-Type": "text/html" },
  }
);
```

    •	This sends the GitHub token and user role to the frontend.

6️⃣ Frontend Receives Message & Stores Token
• The main Sveltia CMS frontend listens for the postMessage event:

```javascript
window.addEventListener("message", (event) => {
  if (event.data.backendName === "github" && event.data.token) {
    localStorage.setItem(
      "sveltia-cms.user",
      JSON.stringify({
        backendName: "github",
        token: event.data.token,
      })
    );

    //  Store user role (admin, editor, viewer)
    if (event.data.role) {
      localStorage.setItem("sveltia-cms.userRole", event.data.role);
    }

    window.location.reload(); //  Refresh CMS
  }
});
```

7️⃣ Hide or Restrict Access Based on Role
• In Sveltia CMS, the user’s role is now stored in localStorage.
• We hide admin-only pages:

```javascript
{#if $userRole === "admin"}
  <Button label="Admin Settings" on:click={openAdminPanel} />
{/if}
```

    •	We block navigation to restricted pages:

```javascript
if (
  pageName === "collections" &&
  $selectedCollection?.is_admin &&
  userRole !== "admin"
) {
  window.location.replace("#/collections");
  alert("🚫 You do not have permission to access this collection.");
  return;
}
```

🎯 Final Result

1️⃣ Users click “Sign in with ORCID”.
2️⃣ They log in via ORCID.
3️⃣ Cloudflare Worker verifies their ORCID.
4️⃣ If valid, they get a GitHub token & role (admin/editor/viewer).
5️⃣ Frontend stores credentials & reloads Sveltia CMS.
6️⃣ Admins see special features, editors can modify, viewers have read-only access.

🚀 Next Steps

Also done
Improve logout handling (Clear role on sign-out)

## NextCloud

📄 Nextcloud Integration - Overview

1️⃣ Project Goals

The goal of this integration was to embed Nextcloud inside our Svelte app, allowing users to view, navigate, upload, download, and manage files directly from the UI.

2️⃣ Authentication & API Communication

To interact with Nextcloud, we used a Cloudflare Worker as a proxy that:
• Authenticates requests using Nextcloud credentials stored securely.
• Handles CORS issues by allowing cross-origin requests.
• Processes API calls from the Svelte frontend.

3️⃣ Folder & File Navigation

The app provides a file explorer-style UI:
• Folder Navigation: Users can open folders and navigate back to the parent directory.
• Breadcrumb System: Displays the current path and allows going back.
• Nextcloud WebDAV Requests: Uses the PROPFIND method to fetch files and folders dynamically.

4️⃣ File Operations

The system enables:
• Downloading Files: Clicking on a file retrieves it from Nextcloud.
• Uploading Files: Users can upload new files into the selected folder.
• Deleting Files & Folders: Users can remove items with a confirmation step.

5️⃣ UI Enhancements
• Two-column layout: Folders on the left, files on the right.
• Interactive buttons: Clickable file areas, hover effects, and smooth transitions.
• Consistent design: Matching styles for uploads, deletions, and navigation.

6️⃣ Challenges & Solutions

Challenge Solution
CORS Issues Cloudflare Worker Proxy
Navigating Folders Implemented a dynamic path tracking system
Uploading in Subfolders Properly formatted folder paths in requests
Deleting Files & Folders Implemented separate API endpoints for both

7️⃣ Future Improvements 

- Add file preview (images, PDFs, etc.). 
- Group permissions to access specific folders. 
  - Upgrade ed to be not hardcoded (usiing a yml file)
- Bulk file operations (downloads, deletions).
- Search functionality for files and folders.
- edit files [jwt tokent for nextcloud]
- improve secret management for NextCloud API (block access to the worker)
