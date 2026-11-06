// LeishMan Nextcloud proxy worker (v2).
//
// Every request must carry a session token issued by the ORCID worker
// (header "Authorization: Bearer <token>", or `access_token` query parameter for plain
// download links). The token lists the top-level folders the person may read; admins get "*".
//   - read  (files, download): allowed folders only
//   - write (upload, create-folder, delete-*, share): admins only
//
// Secrets (wrangler secret put): NEXTCLOUD_PASSWORD, SESSION_SECRET
// Vars (wrangler.toml): NEXTCLOUD_URL, NEXTCLOUD_USER, ALLOWED_ORIGINS

import { isAllowedOrigin, verifySession } from "../shared/session.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/debug") return json({ ok: true, version: 2 }, 200, cors);

    const route = ROUTES[url.pathname.replace(/\/+$/, "")];
    if (!route) return json({ error: "Not found" }, 404, cors);

    const session = await getSession(request, url, env);
    if (!session) return json({ error: "Login required" }, 401, cors);
    if (route.write && session.role !== "admin") return json({ error: "Admins only" }, 403, cors);

    try {
      const res = await route.handler(request, url, env, session);
      const headers = new Headers(res.headers);
      for (const [k, v] of Object.entries(cors)) headers.set(k, v);
      return new Response(res.body, { status: res.status, headers });
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status, cors);
      console.error("nextcloud worker error", err);
      return json({ error: "Internal error" }, 500, cors);
    }
  },
};

const ROUTES = {
  "/api/nextcloud/files": { handler: listFiles },
  "/api/nextcloud/download": { handler: downloadFile },
  "/api/nextcloud/upload": { handler: uploadFile, write: true },
  "/api/nextcloud/create-folder": { handler: createFolder, write: true },
  "/api/nextcloud/delete-folder": { handler: deleteFolder, write: true },
  "/api/nextcloud/delete-file": { handler: deleteFile, write: true },
  "/api/nextcloud/share": { handler: shareLink, write: true },
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...extra } });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = isAllowedOrigin(origin, env.ALLOWED_ORIGINS);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Groups, X-Worker-Token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

async function getSession(request, url, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : url.searchParams.get("access_token");
  return verifySession(token, env.SESSION_SECRET);
}

/* ---------------- paths & permissions ---------------- */

function davBase(env) {
  return `${env.NEXTCLOUD_URL.replace(/\/+$/, "")}/remote.php/dav/files/${encodeURIComponent(env.NEXTCLOUD_USER)}`;
}

/**
 * Accepts either a relative path ("Biobanking/x.pdf") or the absolute WebDAV href returned by
 * the listing ("/remote.php/dav/files/<user>/Biobanking/x.pdf"). Returns the clean relative path
 * as an array of segments. Rejects traversal.
 */
function toSegments(raw, env) {
  let p = String(raw ?? "");
  try {
    p = decodeURIComponent(p);
  } catch {
    throw new HttpError(400, "Bad path");
  }
  p = p.replace(/\\/g, "/").replace(new RegExp(`^/?remote\\.php/dav/files/${escapeRe(env.NEXTCLOUD_USER)}/?`), "");
  const segs = p.split("/").filter(Boolean);
  if (segs.some((s) => s === ".." || s === "." || s.includes("\0"))) throw new HttpError(400, "Bad path");
  return segs;
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function canRead(session, topFolder) {
  const f = session.folders || [];
  return f.includes("*") || f.includes(topFolder);
}

function requireRead(session, segs) {
  if (!segs.length) throw new HttpError(400, "Missing path");
  if (!canRead(session, segs[0])) throw new HttpError(403, "No access to this folder");
}

function davUrl(env, segs) {
  return `${davBase(env)}/${segs.map(encodeURIComponent).join("/")}`;
}

function ncAuth(env) {
  return { Authorization: `Basic ${btoa(`${env.NEXTCLOUD_USER}:${env.NEXTCLOUD_PASSWORD}`)}` };
}

/* ---------------- handlers ---------------- */

async function listFiles(request, url, env, session) {
  const segs = toSegments(url.searchParams.get("folder") || "", env);
  // The root listing is filtered below; any deeper listing requires access to its top folder.
  if (segs.length) requireRead(session, segs);

  const res = await fetch(segs.length ? davUrl(env, segs) + "/" : davBase(env) + "/", {
    method: "PROPFIND",
    headers: { ...ncAuth(env), Depth: "2", "Content-Type": "application/xml" },
  });
  if (!res.ok) throw new HttpError(res.status === 404 ? 404 : 502, "Folder not available");

  let { files, folders } = parseListing(await res.text(), env);
  if (!segs.length) {
    // root: only show what this person may open
    const keep = (item) => canRead(session, toSegments(item.path, env)[0]);
    files = files.filter(keep);
    folders = folders.filter(keep);
  }
  return json({ files, folders });
}

async function downloadFile(request, url, env, session) {
  const segs = toSegments(url.searchParams.get("file"), env);
  requireRead(session, segs);
  const res = await fetch(davUrl(env, segs), { headers: ncAuth(env) });
  if (!res.ok) throw new HttpError(404, "File not found");
  const name = segs[segs.length - 1].replace(/["\r\n]/g, "_");
  const inline = url.searchParams.get("inline") === "1";
  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function uploadFile(request, url, env) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") throw new HttpError(400, "No file uploaded");
  const segs = [...toSegments(form.get("folder") || "", env), ...toSegments(file.name, env)];
  const res = await fetch(davUrl(env, segs), { method: "PUT", headers: ncAuth(env), body: file.stream() });
  if (!res.ok) throw new HttpError(res.status, `Upload failed: ${res.statusText}`);
  return json({ message: "File uploaded" });
}

async function createFolder(request, url, env) {
  const { folder } = await request.json();
  const segs = toSegments(folder, env);
  if (!segs.length) throw new HttpError(400, "Missing folder");
  const res = await fetch(davUrl(env, segs), { method: "MKCOL", headers: ncAuth(env) });
  if (!res.ok) throw new HttpError(res.status, "Failed to create folder");
  return json({ message: "Folder created", folder });
}

async function deleteFolder(request, url, env) {
  const { folder } = await request.json();
  const segs = toSegments(folder, env);
  if (segs.length < 2) throw new HttpError(400, "Top-level group folders cannot be deleted from the website");
  const res = await fetch(davUrl(env, segs) + "/", { method: "DELETE", headers: ncAuth(env) });
  if (!res.ok) throw new HttpError(res.status, "Failed to delete folder");
  return json({ message: `Folder deleted: ${segs.join("/")}` });
}

async function deleteFile(request, url, env) {
  const segs = toSegments(url.searchParams.get("file"), env);
  if (!segs.length) throw new HttpError(400, "Missing file");
  const res = await fetch(davUrl(env, segs), { method: "DELETE", headers: ncAuth(env) });
  if (!res.ok) throw new HttpError(res.status, "File deletion failed");
  return json({ message: `File deleted: ${segs.join("/")}` });
}

/** Admins only: returns (or creates) a public read-only Nextcloud link. */
async function shareLink(request, url, env) {
  const segs = toSegments(url.searchParams.get("file"), env);
  if (!segs.length) throw new HttpError(400, "Missing file");
  const api = `${env.NEXTCLOUD_URL.replace(/\/+$/, "")}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
  const headers = { ...ncAuth(env), "OCS-APIRequest": "true", Accept: "application/json" };
  const path = "/" + segs.join("/");

  const existing = await fetch(`${api}?path=${encodeURIComponent(path)}`, { headers });
  const shares = (await existing.json().catch(() => ({})))?.ocs?.data || [];
  const pub = shares.find((s) => s.share_type === 3 && s.permissions === 1);
  if (pub?.url) return json({ url: pub.url });

  const res = await fetch(api, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ path, shareType: "3", permissions: "1" }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ocs?.data?.url) throw new HttpError(502, "Failed to create share link");
  return json({ url: data.ocs.data.url });
}

/**
 * Same output shape as v1 (the website and the CMS rely on it):
 * { files: [{name, path}], folders: [{name, path, depth}] } with absolute WebDAV hrefs.
 */
function parseListing(xmlText, env) {
  const files = [];
  const folders = [];
  const prefix = `/remote.php/dav/files/${env.NEXTCLOUD_USER}/`;
  for (const m of xmlText.matchAll(/<d:href>([^<]+)<\/d:href>/g)) {
    const href = m[1];
    const isDir = href.endsWith("/");
    const rel = href.startsWith(prefix) ? href.slice(prefix.length) : href;
    const parts = rel.split("/").filter(Boolean);
    if (!parts.length) continue; // the root itself
    const name = safeDecode(parts[parts.length - 1]);
    const depth = href.split("/").length - 6; // kept for compatibility with v1 consumers
    if (isDir) {
      if (depth > 0) folders.push({ name, path: href, depth });
    } else {
      files.push({ name, path: href });
    }
  }
  return { files, folders };
}

function safeDecode(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}
