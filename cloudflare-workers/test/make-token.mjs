// Prints a test session token (local development only).
// Usage: node --env-file=<file with SESSION_SECRET> test/make-token.mjs <role> <folder,folder> [first] [last]
import { signSession } from "../shared/session.js";

const [role = "viewer", folders = "Biobanking", fn = "Test", ln = "Member"] = process.argv.slice(2);
console.log(
  await signSession({ sub: "0000-0000-0000-0000", fn, ln, role, folders: folders.split(",") }, process.env.SESSION_SECRET),
);
