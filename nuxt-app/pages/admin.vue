<template>
  <div id="sveltia-cms"></div>
</template>

<script setup>
useHead({
  title: 'Content Manager Leishman',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'robots', content: 'noindex' }
  ],
  script: [
    { src: '/admin/dist/sveltia-cms.js' }
  ]
})
</script>
