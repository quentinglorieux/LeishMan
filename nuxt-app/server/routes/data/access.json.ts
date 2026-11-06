// Prerendered at build time (see nuxt.config.ts > nitro.prerender.routes).
// Consumed by the Cloudflare workers (cloudflare-workers/) to decide who can read which folder.
import { queryCollection } from "@nuxt/content/nitro";
import { buildAccessMap } from "../../utils/access";

export default defineEventHandler(async (event) => {
  const members = await queryCollection(event, "members")
    .select("stem", "firstname", "lastname", "orcid")
    .all();
  const groups = await queryCollection(event, "projects")
    .select("title", "folder", "members")
    .all();

  setHeader(event, "content-type", "application/json; charset=utf-8");
  setHeader(event, "cache-control", "no-cache");
  return buildAccessMap(process.cwd(), members as any, groups as any);
});
