---
search:
  exclude: true
---

# Deployment

!!! info "Restricted section"
    These pages are password protected and excluded from the site search.

## Website (Netlify)

Every push to `main` deploys [leishman.netlify.app](https://leishman.netlify.app). Every pull request gets a *deploy preview* (`https://deploy-preview-N--leishman.netlify.app`).

The custom domain `leishman-network.org` is registered through Netlify (Name.com). It must be renewed every year (October); auto-renewal must be enabled before the expiry date.

## Cloudflare workers

The workers are deployed with Wrangler from `cloudflare-workers/<worker>/`:

```bash
npx wrangler login
cd cloudflare-workers/orcid-sveltia
npx wrangler secret put SESSION_SECRET      # long random string, e.g. `openssl rand -hex 32`
npx wrangler secret put ORCID_CLIENT_ID
npx wrangler secret put ORCID_CLIENT_SECRET
npx wrangler secret put GITHUB_BOT_TOKEN
npx wrangler deploy

cd ../nextcloud-leishman
npx wrangler secret put SESSION_SECRET      # SAME value as above
npx wrangler secret put NEXTCLOUD_PASSWORD  # preferably a Nextcloud *app password*
npx wrangler deploy
```

Non-secret settings (`BASE_URL`, `FRONT_URL`, `ACCESS_URL`, `ALLOWED_ORIGINS`, `NEXTCLOUD_URL`, `NEXTCLOUD_USER`) are in each `wrangler.toml`. Add the custom domain to `ALLOWED_ORIGINS` and `FRONT_URL` when it is back online.

### Order for the v2 switch

1. Merge the website changes into `main` and wait for the Netlify deploy (`/data/access.json` must exist).
2. Set the secrets and deploy **both** workers (commands above).
3. Test: log in on a group page, open a file; log in to `/admin/` as an administrator.
4. In the Cloudflare dashboard, remove the old plain-text variables that are now secrets or unused (`USER_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_ORCID_USERS`, `NEXTCLOUD_USERNAME`).
5. Rotate the credentials that were stored in plain text (see [Security notes](security.md)).

Between steps 1 and 2 the website still works with the old workers (it sends both the new session and the legacy group header).

## This documentation

Create a second Netlify site from the same repository with **Base directory** `docs`. `docs/netlify.toml` installs MkDocs Material and builds with `mkdocs build --strict`.

Local preview:

```bash
cd docs && pip install -r requirements.txt && mkdocs serve
```

Screenshots are in `docs/docs/assets/screens/`.
