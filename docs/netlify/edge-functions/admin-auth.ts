// Password protection for the maintainers section of the docs (/admin/*).
// Basic auth, password from the Netlify environment variable DOCS_ADMIN_PASSWORD
// (Site configuration > Environment variables). Any user name is accepted.
// If the variable is not set, the section stays closed.
import type { Config, Context } from "@netlify/edge-functions";

const REALM = "LeishMan docs, maintainers";

function safeEqual(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function deny(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

export default async (request: Request, context: Context) => {
  const expected = Netlify.env.get("DOCS_ADMIN_PASSWORD");
  if (!expected) return deny();

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return deny();

  let decoded = "";
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0)));
  } catch {
    return deny();
  }
  const password = decoded.slice(decoded.indexOf(":") + 1);
  if (!safeEqual(password, expected)) return deny();

  const response = await context.next();
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  return response;
};

export const config: Config = {
  path: ["/admin", "/admin/*"],
};
