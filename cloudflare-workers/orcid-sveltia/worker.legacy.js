
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/debug") {
      return new Response("Cloudflare Worker is running!", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (url.pathname === "/auth/orcid") {
      return handleOrcidAuth(env);
    } else if (url.pathname === "/auth/orcid/callback") {
      return handleOrcidCallback(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

/**
 * Redirect user to ORCID for authentication.
 */
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


/**
 * ORCID Authentication Handler
 */
async function handleOrcidCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Error: ORCID code missing.", { status: 400 });
  }

  // Step 1: Exchange ORCID code for access token
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

  // Step 2: Check user role (admin, editor, viewer)
  const userInfo = await getUserInfo(orcidId);
  if(userInfo){
    console.log(userInfo)
  }
  if (!userInfo) {
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Access Denied</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: #f8f9fa;
              }
              .container {
                  text-align: center;
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              p {
                  color: #333;
              }
              .contact {
                  margin-top: 15px;
                  font-size: 14px;
                  color: #666;
              }
              .btn {
                  display: inline-block;
                  margin-top: 20px;
                  padding: 10px 20px;
                  color: white;
                  background: #007bff;
                  text-decoration: none;
                  border-radius: 5px;
              }
              .btn:hover {
                  background: #0056b3;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>You are not registered  </h1>
              <p>Your ORCID ID is not registered as an administrator for Leishman.</p>
              <p>Please contact the website manager to request access.</p>
              <p class="contact">For assistance, reach out to <strong>clea.melenotte@aphp.fr</strong></p>
              <button class="btn" onclick="window.close()"> Close</button>
          </div>
      </body>
      </html>
    `;

    return new Response(htmlResponse, { headers: { "Content-Type": "text/html" } });
  }

  // Step 3: Authenticate with Nextcloud
  const nextcloudAuthHeader = "Basic " + btoa(`${env.NEXTCLOUD_USERNAME}:${env.NEXTCLOUD_PASSWORD}`);
  const nextcloudResponse = await fetch("https://nextcloud.rubidiumweb.fr/remote.php/dav/files/quentin/", {
    method: "PROPFIND",
    headers: {
      Authorization: nextcloudAuthHeader,
      "Depth": "1",
      "Content-Type": "application/xml",
    },
  });

  const nextcloudAuthSuccess = nextcloudResponse.ok ? "true" : "false";

  const { role, groups, firstname, lastname, orcid } = userInfo;

  return new Response(`
    <script>
      window.opener.postMessage({
        backendName: "github",
        token: "${env.GITHUB_BOT_TOKEN}",
        role: "${role}",
        groups: ${JSON.stringify(groups)},
        firstname: "${firstname}",
        lastname: "${lastname}",
        orcid: "${orcid}"
      }, "*");
      window.close();
    </script>
  `, { headers: { "Content-Type": "text/html" } });
}


/**
 * Fetch and determine user role from YAML files.
 */
async function getUserInfo(orcidId) {
  const roles = ["admin", "editor", "viewer"];
  const baseUrl = "https://leishman.netlify.app/data/users/";

  for (const role of roles) {
    const response = await fetch(`${baseUrl}${role}.yml`, {
      headers: { "Cache-Control": "no-cache" },
    });

    if (response.ok) {
      const yamlText = await response.text();
      
      const userData = parseStructuredYAML(yamlText);
     
      for (const user of userData) {
        if (user.orcid === orcidId) {
          return {
            role,
            groups: user.group || [],
            firstname: user.firstname || "",
            lastname:  Object.keys(user) || "",
            orcid: user.orcid || "orcid"
          };
        }
      }
    }
  }

  return null; // ❌ User not found
}



/**
 * Fetch and parse the admin ORCID list from the Netlify YAML file.
 */
async function fetchAdminOrcids() {
  try {
    // const response = await fetch("https://raw.githubusercontent.com/quentinglorieux/LeishMan/refs/heads/main/nuxt-app/public/data/users/admin.yml?timestamp=17000", {
    const response = await fetch("https://leishman.netlify.app/data/users/admin.yml", {
      headers: { "Cache-Control": "no-cache" },
    });

    if (!response.ok) {
      console.error("❌ Failed to fetch admin list:", response.statusText);
      return [];
    }

    const yamlText = await response.text();
    return parseYAML(yamlText);
  } catch (error) {
    console.error("❌ Error fetching or parsing admin list:", error);
    return [];
  }
}

/**
 * Parses a YAML string manually (supports structured lists).
 */
// function parseYAML(yamlText) {
//   return yamlText
//     .split('\n')
//     .map(line => line.trim())
//     .filter(line => line.startsWith('orcid:'))
//     .map(line => {
//       // Extract value after colon, remove quotes, and trim
//       const value = line.split(':')[1]?.trim().replace(/['"]/g, '') || '';
//       return value;
//     })
//     .filter(Boolean); // Remove empty values
// }

function parseStructuredYAML(yamlText) {
  const yamlLines = yamlText.split("\n");
  const result = [];
  let currentUser = null;

  for (let line of yamlLines) {
    line = line.trim();

    if (line.startsWith("- lastname:")) {
      if (currentUser) result.push(currentUser);
      currentUser = { group: [] }; // Initialize user object
    }

    if (!currentUser) continue;

    // Match `key: value` pairs
    const keyValueMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyValueMatch) {
      const key = keyValueMatch[1];
      let value = keyValueMatch[2].trim().replace(/['"]/g, ""); // Remove quotes

      if (key === "group") {
        // Group starts here, next lines will be groups
        currentUser.group = [];
      } else {
        currentUser[key] = value;
      }
    } else if (line.startsWith("-")) {
      // ✅ This is a group item (continuation of group list)
      const groupName = line.replace(/^-/, "").trim();
      currentUser.group.push(groupName);
    }
  }

  if (currentUser) result.push(currentUser);
  return result;
}

/**
 * Check if the ORCID ID is in the admin list.
 */
async function isAllowedOrcidUser(orcidId) {
  console.log("orcid", orcidId);
  const adminOrcids = await fetchAdminOrcids();
  console.log("✅ Allowed ORCIDs:", adminOrcids);
  return adminOrcids.includes(orcidId);
}
