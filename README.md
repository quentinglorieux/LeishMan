# LeishMan Site
- git clone
- Enter the project folder `cd leishman/nuxt-app`
- Install dependencies `npm install`
- run the front-end in nuxt-app folder : `npm run dev`
- generate the static site `npx nuxi generate`
- serve the static site `npx serve .output/public     `
- enjoy


### PagesCMS
- This config use the PagesCMS to manage the content of the site.
- Config file is `.pages.yml`
- and storage is in `pagescms/` folder

### Decap/Sveltia
- This config use the Decap/Sveltia to manage the content of the site.
- Config file is `nuxt-app/public/admin/config.yml`
- To switch between PagesCMS and Decap/Sveltia, change between these two lines in `nuxt-app/public/admin/index.html`
```html
 <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script> 
 ```
 or 
 ```html
 <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

## Recent notes
- The site is now hosted on Netlify
- The site is now using Sveltia CMS
I have made modification to Sveltia 0.55.0 to allow for ORCID login and Publication fetc

### DOI
📖 DOI Import Module

This module adds a DOI import feature to fetch and display publication metadata from CrossRef.

🏗 Structure
	•	doiService.js (📍 $lib/services/contents/) – Handles API calls to fetch DOI metadata.
	•	ImportPubliDialog.svelte (📍 $lib/components/contents/shared/) – UI dialog for DOI entry and metadata display.
	•	Main File Changes – Imports and binds ImportPubliDialog with minimal updates.

🚀 How It Works
	1.	User enters a DOI in the import dialog.
	2.	doiService.js fetches metadata from CrossRef.
	3.	Dialog displays publication details or an error message.
	4.	A toast notification confirms successful import.

🔗 Reusable, modular, and easy to extend! 🎯. More details on [new-features.md](new-features.md)

### Login
Using ORCID for login
Via a worker in Cloudflare, the site is able to authenticate users via ORCID. This is done by redirecting the user to ORCID for authentication and then back to the site with the user's ORCID ID (and a GitHub generic token). 
See details [new-features.md](new-features.md#login)