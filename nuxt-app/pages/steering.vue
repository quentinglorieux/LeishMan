<template>
  <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Leadership</p>
      <h1 class="font-display text-3xl sm:text-4xl">Our steering committee</h1>
    </div>
  </section>

  <section class="py-12">
    <div class="text-center">
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="member in contact"
          :key="member.lastname"
          class="rounded-[22px] border border-white/70 bg-white/80 p-6 shadow-lg text-left"
        >
        
          <img :src="member.thumbnail"
            alt="Team Member"
            class="h-32 w-32 mx-auto rounded-full object-cover object-top mb-4 border-4 border-white shadow-md"
          />
          <h3 class="font-display text-xl text-slate-900">
            {{ member.firstname + " " + member.lastname }}
          </h3>
          <p class="text-sm text-slate-600">{{ member.role }}</p>
          <p class="text-sm text-slate-600">Contact : {{ member.mail }}</p>

          <UAccordion
            class="mt-4 text-sm text-slate-700 text-left"
            color="blue"
            variant="soft"
            size="md"
            open-icon="i-heroicons-plus"
            close-icon="i-heroicons-minus"
            :items="[{ label: 'Short biography', content: member.shortbio }]"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const contact = await queryCollection("members").all();
</script>

<style scoped></style>
