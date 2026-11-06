# Security notes

Findings of the November 2026 review and what the v2 workers change.

| Issue (before v2) | Status with v2 |
|---|---|
| The Nextcloud worker had **no authentication**: anyone could list, download, upload and delete files in every folder (including `Admin-Files` and `Consortium`). | Fixed: signed session required, folder check, writes admin only, traversal rejected, CORS limited to the site. |
| Access was checked **in the browser** (`X-User-Groups` header, `localStorage`), so it could be bypassed. | Fixed: the worker decides from the signed session. |
| Every ORCID login (even read-only members) received the **GitHub token** with write access to the repository. | Fixed: only admins and editors receive it. |
| The ORCID callback sent the result with `postMessage(..., "*")` and did not check the OAuth `state`. | Fixed: allowlisted origin, `state` checked against a cookie. |
| Public share links (permanent, anonymous) were created for previews by any visitor. | Fixed: previews are streamed through the worker; share links admin only. |
| Secrets (GitHub token, Nextcloud password, ORCID secret) stored as **plain-text variables** in Cloudflare, visible in the dashboard. | To do at deployment: move them to secrets and **rotate** them. |
| The worker uses the personal Nextcloud account `quentin`. | Recommended: a dedicated Nextcloud account owning only the LeishMan folders, with an app password. |
| `public/data/users/*.yml` (with e-mail addresses) are publicly downloadable. | Open: the workers no longer need them (they read `/data/access.json`). They can be moved out of `public/` once the v2 workers are deployed. |

## Credentials to rotate after deploying v2

- GitHub token `GITHUB_BOT_TOKEN` (it was given to every member who logged in).
- Nextcloud password of the service account (replace by an app password).
- ORCID client secret.
