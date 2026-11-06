# LeishMan website guide

This guide explains how the [LeishMan network website](https://leishman.netlify.app) works and how to keep it up to date.

<div class="grid cards" markdown>

- :material-account-group: **I am a working-group member**

    I want to read my group's private documents.

    [Reading your group's documents](members/documents.md)

- :material-pencil: **I edit the website**

    News, events, working groups, members, access.

    [Signing in to the editor](editors/getting-started.md)

- :material-cog: **I maintain the website**

    How the pieces fit together, deployment, security.

    [How the website works](admin/architecture.md)

</div>

## What changed in November 2026

- **Working groups list their members as cards** (group leaders first, photo or initials, institution, ORCID link). The list is edited with a member picker in the editor instead of free text.
- **The member list decides who can read the group documents.** A member whose page has an ORCID iD can sign in with ORCID on the group page and open the group folder. No more separate lists to keep in sync.
- **The documents are protected on the server side.** Before, the document service could be used without logging in.
- **The reference centres map uses OpenStreetMap** instead of Google Maps (no API key, faster, centred on Europe).
