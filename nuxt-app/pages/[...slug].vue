<template>
    <main>
      <ContentDoc />
      <NuxtLink v-if="prev" :to="prev._path">{{ prev.title }}</NuxtLink> and 
      <NuxtLink v-if="next" :to="next._path">{{ next.title }}</NuxtLink>
    </main>
  </template>
  <script setup lang="ts">
  const { prev, next } = useContent()
  </script>
  