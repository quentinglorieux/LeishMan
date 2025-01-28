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
<!-- dyn-oliv -->