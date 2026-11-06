import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";

/**
 * Access model for the private working-group documents (Nextcloud).
 *
 * One person = one ORCID iD. Read access to a group folder is granted when:
 *   1. the person is listed as a member of the working group (content/projects/*.md,
 *      field `members`) AND their member page has an ORCID, or
 *   2. the person is listed in the "extra access" files public/data/users/viewer.yml
 *      (legacy lists, still honoured), or
 *   3. the person is an admin (public/data/users/admin.yml): admins see every folder.
 *
 * The result is published (prerendered) as /data/access.json and read by the
 * Cloudflare workers. It contains no e-mail addresses.
 */

export type Role = "admin" | "editor" | "viewer";

export interface AccessEntry {
  firstname: string;
  lastname: string;
  role: Role;
  /** Nextcloud top-level folders this person may read. "*" = all. */
  folders: string[];
}

export interface AccessMap {
  version: 1;
  generated: string;
  /** folder name -> working group info */
  folders: Record<string, { title: string; path: string }>;
  users: Record<string, AccessEntry>;
}

const ORCID_RE = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

/** Legacy group labels used in admin.yml / viewer.yml -> Nextcloud folder. */
const LEGACY_GROUPS: Record<string, string> = {
  biobanking: "Biobanking",
  diagnostic: "Diagnostic-procedure",
  "diagnostic-procedure": "Diagnostic-procedure",
  epidemiology: "Epidemiology",
  lc: "LC-treatment",
  "lc-treatment": "LC-treatment",
  "treatment optimization lc": "LC-treatment",
  lv: "VL-treatment",
  vl: "VL-treatment",
  "lv-treatment": "VL-treatment",
  "vl-treatment": "VL-treatment",
  visceral: "VL-treatment",
  "visceral leishmaniasis": "VL-treatment",
  "treatment optimization lv": "VL-treatment",
  recommendations: "Recommendations",
  recommandations: "Recommendations",
  admin: "Admin-Files",
};

export function normalizeOrcid(v: unknown): string | null {
  const s = String(v ?? "")
    .trim()
    .replace(/^https?:\/\/orcid\.org\//i, "")
    .toUpperCase();
  return ORCID_RE.test(s) ? s : null;
}

export function legacyGroupToFolder(g: unknown): string | null {
  const k = String(g ?? "").trim().toLowerCase();
  return LEGACY_GROUPS[k] ?? (k ? String(g).trim() : null);
}

interface LegacyUser {
  firstname?: string;
  lastname?: string;
  orcid?: string;
  group?: string[];
}

async function readLegacy(rootDir: string, file: string, key: string): Promise<LegacyUser[]> {
  try {
    const raw = await readFile(join(rootDir, "public/data/users", file), "utf8");
    const data = parse(raw) ?? {};
    return Array.isArray(data[key]) ? data[key] : [];
  } catch {
    return [];
  }
}

interface MemberDoc {
  stem: string;
  firstname?: string;
  lastname?: string;
  orcid?: string;
}
interface GroupDoc {
  title?: string;
  folder?: string;
  members?: { member: string; leader?: boolean }[];
}

export async function buildAccessMap(
  rootDir: string,
  members: MemberDoc[],
  groups: GroupDoc[],
): Promise<AccessMap> {
  const users: Record<string, AccessEntry> = {};
  const folders: AccessMap["folders"] = {};

  const grant = (orcid: string | null, first: string, last: string, role: Role, folder: string | null) => {
    if (!orcid) return;
    const u = (users[orcid] ??= { firstname: first || "", lastname: last || "", role, folders: [] });
    if (role === "admin" || (role === "editor" && u.role === "viewer")) u.role = role;
    if (!u.firstname && first) u.firstname = first;
    if (!u.lastname && last) u.lastname = last;
    if (folder && !u.folders.includes(folder)) u.folders.push(folder);
  };

  // 1. working-group membership
  const byStem = new Map(members.map((m) => [m.stem.split("/").pop()!, m]));
  for (const g of groups) {
    if (!g.folder) continue;
    folders[g.folder] = { title: g.title ?? g.folder, path: g.folder };
    for (const ref of g.members ?? []) {
      const m = byStem.get(ref.member);
      if (!m) continue;
      grant(normalizeOrcid(m.orcid), m.firstname ?? "", m.lastname ?? "", "viewer", g.folder);
    }
  }

  // 2. extra access (legacy lists) and roles
  const lists: [string, string, Role][] = [
    ["viewer.yml", "viewer_list", "viewer"],
    ["editor.yml", "editor_list", "editor"],
    ["admin.yml", "admin_list", "admin"],
  ];
  for (const [file, key, role] of lists) {
    for (const u of await readLegacy(rootDir, file, key)) {
      const orcid = normalizeOrcid(u.orcid);
      const groupsOf = (u.group ?? []).map(legacyGroupToFolder).filter(Boolean) as string[];
      if (!groupsOf.length) grant(orcid, u.firstname ?? "", u.lastname ?? "", role, null);
      for (const f of groupsOf) grant(orcid, u.firstname ?? "", u.lastname ?? "", role, f);
    }
  }

  for (const u of Object.values(users)) {
    if (u.role === "admin") u.folders = ["*"];
    else u.folders.sort();
  }

  return { version: 1, generated: new Date().toISOString(), folders, users };
}
