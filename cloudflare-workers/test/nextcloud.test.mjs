// Integration tests for the Nextcloud worker running locally (`wrangler dev`, read-only checks).
// Usage: SESSION_SECRET=... WORKER=http://localhost:8787 node test/nextcloud.test.mjs
import assert from "node:assert/strict";
import { signSession, verifySession, isAllowedOrigin } from "../shared/session.js";

const W = process.env.WORKER || "http://localhost:8787";
const S = process.env.SESSION_SECRET;
let failures = 0;

async function t(name, fn) {
  try {
    await fn();
    console.log("ok  ", name);
  } catch (e) {
    failures++;
    console.log("FAIL", name, "-", e.message);
  }
}

const viewer = await signSession({ sub: "0000-0000-0000-0001", role: "viewer", folders: ["Biobanking"] }, S);
const admin = await signSession({ sub: "0000-0000-0000-0002", role: "admin", folders: ["*"] }, S);
const expired = await signSession({ sub: "x", role: "admin", folders: ["*"] }, S, -10);
const forged = await signSession({ sub: "x", role: "admin", folders: ["*"] }, "another-secret-another-secret-123456");
const get = (path, token, init = {}) =>
  fetch(W + path, { ...init, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } });

// unit
await t("session roundtrip", async () => assert.equal((await verifySession(viewer, S)).folders[0], "Biobanking"));
await t("expired token rejected", async () => assert.equal(await verifySession(expired, S), null));
await t("forged token rejected", async () => assert.equal(await verifySession(forged, S), null));
await t("origin allowlist", async () => {
  const allowed = "https://leishman.netlify.app,https://*--leishman.netlify.app";
  assert.ok(isAllowedOrigin("https://deploy-preview-12--leishman.netlify.app", allowed));
  assert.ok(!isAllowedOrigin("https://evil.com", allowed));
  assert.ok(!isAllowedOrigin("https://leishman.netlify.app.evil.com", allowed));
});

// worker
await t("no token -> 401", async () => assert.equal((await get("/api/nextcloud/files")).status, 401));
await t("forged token -> 401", async () => assert.equal((await get("/api/nextcloud/files", forged)).status, 401));
await t("expired token -> 401", async () => assert.equal((await get("/api/nextcloud/files", expired)).status, 401));
await t("viewer root listing only shows allowed folders", async () => {
  const r = await get("/api/nextcloud/files", viewer);
  assert.equal(r.status, 200);
  const { folders, files } = await r.json();
  const tops = new Set([...folders, ...files].map((f) => decodeURIComponent(f.path).split("/")[5]));
  assert.deepEqual([...tops], ["Biobanking"]);
});
await t("viewer can list own folder", async () => assert.equal((await get("/api/nextcloud/files?folder=Biobanking", viewer)).status, 200));
await t("viewer cannot list other folder", async () => assert.equal((await get("/api/nextcloud/files?folder=Admin-Files", viewer)).status, 403));
await t("traversal rejected", async () => assert.equal((await get("/api/nextcloud/files?folder=Biobanking/../Admin-Files", viewer)).status, 400));
await t("viewer cannot download outside folder", async () =>
  assert.equal((await get("/api/nextcloud/download?file=" + encodeURIComponent("/remote.php/dav/files/quentin/Consortium/x.pdf"), viewer)).status, 403));
await t("viewer cannot delete", async () => assert.equal((await get("/api/nextcloud/delete-file?file=Biobanking/x", viewer, { method: "DELETE" })).status, 403));
await t("viewer cannot create share links", async () => assert.equal((await get("/api/nextcloud/share?file=Biobanking/x", viewer)).status, 403));
await t("admin sees all top folders", async () => {
  const r = await get("/api/nextcloud/files", admin);
  const { folders } = await r.json();
  assert.ok(folders.filter((f) => f.depth === 1).length >= 6);
});
await t("token via query param works for downloads", async () =>
  assert.notEqual((await fetch(`${W}/api/nextcloud/files?folder=Biobanking&access_token=${viewer}`)).status, 401));
await t("CORS: unknown origin not reflected", async () => {
  const r = await fetch(W + "/api/nextcloud/files", { method: "OPTIONS", headers: { Origin: "https://evil.com" } });
  assert.equal(r.headers.get("access-control-allow-origin"), "null");
});

console.log(failures ? `\n${failures} failure(s)` : "\nall tests passed");
process.exit(failures ? 1 : 0);
