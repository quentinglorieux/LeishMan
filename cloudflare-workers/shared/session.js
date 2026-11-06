// Shared helpers for the LeishMan workers: signed session tokens and origin checks.
// Token format: base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload, SESSION_SECRET))

const enc = new TextEncoder();

function b64url(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret) {
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET missing or too short");
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/** Sign a payload. `ttlSeconds` sets `exp`. */
export async function signSession(payload, secret, ttlSeconds = 12 * 3600) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const data = b64url(enc.encode(JSON.stringify(body)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(data));
  return `${data}.${b64url(sig)}`;
}

/** Verify a token; returns the payload or null (bad signature, malformed, expired). */
export async function verifySession(token, secret) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  try {
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), b64urlDecode(sig), enc.encode(data));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(data)));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * ALLOWED_ORIGINS: comma-separated list. A "*" inside an entry matches one DNS label part,
 * e.g. "https://*--leishman.netlify.app" accepts Netlify deploy previews.
 */
export function isAllowedOrigin(origin, allowed) {
  if (!origin) return false;
  return String(allowed || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .some((pattern) => {
      const re = new RegExp("^" + pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[a-z0-9-]+") + "$", "i");
      return re.test(origin);
    });
}

/** Random hex string. */
export function randomId(bytes = 16) {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
}
