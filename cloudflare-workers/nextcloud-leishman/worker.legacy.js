export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ✅ Handle CORS Preflight Requests (OPTIONS)
    if (request.method === "OPTIONS") {
      return handleCORS();
    }

    if (url.pathname === "/api/nextcloud/files") {
      return fetchNextcloudFiles(request, env);
    } else if (url.pathname.startsWith("/api/nextcloud/download")) {
      return downloadFile(request, env);
    } else if (url.pathname.startsWith("/api/nextcloud/upload")) {
      return uploadFile(request, env);
    } else if (url.pathname === "/api/nextcloud/delete-folder") {
      return deleteFolder(request, env);
    } else if (url.pathname.startsWith("/api/nextcloud/create-folder")) {
      return createFolder(request, env);
    } else if (url.pathname.startsWith("/api/nextcloud/delete-file")) {
      return deleteFile(request, env);
    } else if (url.pathname.startsWith("/api/nextcloud/share")) {
      return getNextcloudShareLink(request, env);
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders(),
    });
  },
};

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Groups",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * ✅ Fetch Nextcloud Files & Folders
 */
async function fetchNextcloudFiles(request, env) {
  const url = new URL(request.url);
  let folder = url.searchParams.get("folder") || "";

  const nextcloudURL = `https://nextcloud.rubidiumweb.fr/remote.php/dav/files/${env.NEXTCLOUD_USER}/${folder}`;
  console.log("📂 Fetching Nextcloud URL:", nextcloudURL);

  const response = await fetch(nextcloudURL, {
    method: "PROPFIND",
    headers: {
      Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
      Depth: "2",
      "Content-Type": "application/xml",
    },
  });

  if (!response.ok) {
    console.error("❌ Fetch Failed:", response.statusText);
    return new Response(JSON.stringify({ error: "Fetch failed" }), {
      status: response.status,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  const textResponse = await response.text();
  const { files, folders } = parseXMLManually(textResponse);
  console.log("📂 Parsed Folders:", folders);

  return new Response(JSON.stringify({ files, folders }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

/**
 * ✅ Download File from Nextcloud and Proxy It
 */
async function downloadFile(request, env) {
  const url = new URL(request.url);
  let filePath = url.searchParams.get("file");

  if (!filePath) {
    return new Response("❌ Missing file parameter", {
      status: 400,
      headers: corsHeaders(),
    });
  }

  filePath = decodeURIComponent(filePath);
  filePath = filePath.replace(/^\/?remote.php\/dav\/files\/quentin\//, ""); // ✅ Clean up path


  const nextcloudFileURL = `https://nextcloud.rubidiumweb.fr/remote.php/dav/files/${env.NEXTCLOUD_USER}/${filePath}`;

  const response = await fetch(nextcloudFileURL, {
    method: "GET",
    headers: {
      Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
    },
  });

  if (!response.ok) {
    return new Response(`❌ File not found: ${filePath}`, {
      status: 404,
      headers: corsHeaders(),
    });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filePath.split('/').pop()}"`,
      ...corsHeaders(),
    },
  });
}

async function getNextcloudShareLink(request, env) {
  const url = new URL(request.url);
  let filePath = url.searchParams.get("file");

  if (!filePath) {
    return new Response("❌ Missing file parameter", { status: 400 });
  }

  filePath = decodeURIComponent(filePath).replace(/^\/?remote.php\/dav\/files\/quentin\//, "");

  const nextcloudShareAPI = `https://nextcloud.rubidiumweb.fr/ocs/v2.php/apps/files_sharing/api/v1/shares`;

  // ✅ Get User Groups from the Request Header
  const userGroupsHeader = request.headers.get("X-User-Groups");
  const userGroups = userGroupsHeader ? userGroupsHeader.split(",") : [];
  const isAdmin = userGroups.includes("Admin"); // ✅ Admin check
  console.log("🔹 User Groups Received:", userGroups);

  // ✅ Set Permissions Based on Role
  const sharePermissions = isAdmin ? "19" : "17"; 
  console.log("🔹 Required Share Permissions:", sharePermissions);

  try {
    // ✅ Check if a share already exists
    console.log('fetching in prog ', `${nextcloudShareAPI}?path=${encodeURIComponent(filePath)}`)
    const existingSharesResponse = await fetch(`${nextcloudShareAPI}?path=${encodeURIComponent(filePath)}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
        "OCS-APIRequest": "true",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json",
      },
    });

    const sharesData = await existingSharesResponse.json();
    console.log('sharesData ', sharesData)
    const existingShares = sharesData.ocs?.data || [];
    console.log('existingShares ',existingShares[0].has_preview)
    if (existingShares[0].has_preview) {
      for (const share of existingShares) {
        if (share.share_type === 3) { // ✅ Ensure it's a public link
          console.log("perm ", share.permissions);
          if (share.permissions === parseInt(sharePermissions)) {
            console.log("✅ Existing share has correct permissions:", share.url);
            return new Response(JSON.stringify({ url: share.url }), {
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            });
          } else {
            console.log("Permission mismatch...");
          }
        }
      }
    }

    // ✅ If no correct share exists, create a new one
    console.log("🔹 Creating a new share...");
    const response = await fetch(nextcloudShareAPI, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
        "OCS-APIRequest": "true",
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        path: filePath,
        shareType: "3", // Public link
        permissions: sharePermissions, // ✅ Apply correct permissions
      }),
    });

    const shareData = await response.json();

    if (!response.ok || !shareData.ocs.data.url) {
      return new Response("❌ Failed to create share link", { status: 500 });
    }

    console.log("✅ New share created:", shareData.ocs.data.url);
    return new Response(JSON.stringify({ url: shareData.ocs.data.url }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    console.error("❌ Error handling share request:", error);
    return new Response("❌ Internal server error", { status: 500 });
  }
}


async function uploadFile(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    let folder = formData.get("folder") || ""; // ✅ Get correct folder

    if (!file) {
      return new Response("❌ No file uploaded.", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }

    const fileName = file.name;
    const fileStream = file.stream();

    // ✅ Remove any leading slashes
    if (folder.startsWith("/")) {
      folder = folder.slice(1);
    }

    // ✅ Construct correct Nextcloud upload URL
    const nextcloudURL = `https://nextcloud.rubidiumweb.fr/remote.php/dav/files/${env.NEXTCLOUD_USER}/${folder}/${fileName}`;


    const response = await fetch(nextcloudURL, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
      },
      body: fileStream, // ✅ Upload as a stream
    });

    if (!response.ok) {
      return new Response(`❌ Upload failed: ${response.statusText}`, { status: response.status });
    }

    return new Response("✅ File uploaded successfully!", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // ✅ Fix CORS
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  } catch (error) {
    console.error("❌ Upload Error:", error);
    return new Response("❌ Internal Server Error", { status: 500 });
  }
}



async function createFolder(request, env) {
  if (request.method !== "POST") {
    return new Response("❌ Invalid request method", { status: 405 });
  }

  const { folder } = await request.json();

  if (!folder) {
    return new Response("❌ Missing folder parameter", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });
  }
  // ✅ Remove WebDAV prefix to send a clean path
  let cleanFolder = folder
    .replace(/^\/?remote.php\/dav\/files\/quentin\//, "") // Remove WebDAV prefix
    .replace(/^\/+|\/+$/g, ""); // Remove leading/trailing slashes

  const folderPath = `https://nextcloud.rubidiumweb.fr/remote.php/dav/files/${env.NEXTCLOUD_USER}/${cleanFolder}`;

  const response = await fetch(folderPath, {
    method: "MKCOL",
    headers: {
      Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
    },
  });

  if (!response.ok) {
    return new Response(`❌ Failed to create folder`, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });
  }

  return new Response(JSON.stringify({ message: "✅ Folder created successfully", folder }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}



async function deleteFolder(request, env) {
  const { folder } = await request.json();

  if (!folder) {
    return new Response("❌ Missing folder parameter", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });
  }

  let cleanFolder = folder
    .replace(/^\/?remote.php\/dav\/files\/quentin\//, "") // Remove WebDAV prefix
    .replace(/^\/+|\/+$/g, ""); // Remove leading/trailing slashes

  if (!cleanFolder) {
    return new Response("❌ Cannot delete root folder!", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });
  }

  const nextcloudURL = `https://nextcloud.rubidiumweb.fr/remote.php/dav/files/${env.NEXTCLOUD_USER}/${cleanFolder}`;

  const response = await fetch(nextcloudURL, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
    },
  });

  if (!response.ok) {
    return new Response(`❌ Failed to delete folder: ${cleanFolder}`, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });
  }

  return new Response(`✅ Folder deleted: ${cleanFolder}`, {
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    },
  });
}


/**
 * ✅ **Delete File from Nextcloud**
 */
async function deleteFile(request, env) {
  const url = new URL(request.url);
  let filePath = url.searchParams.get("file");

  if (!filePath) {
    return new Response("❌ Missing file parameter", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });
  }

  // ✅ Remove WebDAV prefix for cleaner requests
  filePath = filePath.replace(/^\/?remote.php\/dav\/files\/quentin\//, "").trim();

  console.log(`🗑️ Deleting File: ${filePath}`);

  const nextcloudFileURL = `https://nextcloud.rubidiumweb.fr/remote.php/dav/files/${env.NEXTCLOUD_USER}/${filePath}`;

  const response = await fetch(nextcloudFileURL, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${btoa(env.NEXTCLOUD_USER + ":" + env.NEXTCLOUD_PASSWORD)}`,
    },
  });

  if (!response.ok) {
    return new Response(`❌ File deletion failed: ${filePath}`, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      },
    });
  }

  return new Response(`✅ File deleted: ${filePath}`, {
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    },
  });
}

/**
 * ✅ Simple XML Parser to Extract Files & Folders
 */
function parseXMLManually(xmlText) {
  const fileList = [];
  const folderList = [];
  const matches = xmlText.matchAll(/<d:href>([^<]+)<\/d:href>/g);

  for (const match of matches) {
    const filePath = match[1];
    const isDir = filePath.endsWith("/");

    let name = decodeURIComponent(filePath.split("/").filter(Boolean).pop());
    let depth = filePath.split("/").length - 6; // ✅ Adjust depth for Nextcloud structure

    // ✅ Remove Level 0 Folders
    if (isDir && depth > 0) {
      folderList.push({ name, path: filePath, depth });
    } else if (!isDir) {
      fileList.push({ name, path: filePath });
    }
  }

  return { files: fileList, folders: folderList };
}

/**
 * ✅ CORS Headers Helper
 */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PROPFIND",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Depth",
  };
}