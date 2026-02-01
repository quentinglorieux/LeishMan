<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">About</p>
        <h1 class="font-display text-3xl sm:text-4xl">About Us</h1>
        <p class="mt-3 max-w-2xl text-sm text-slate-600">
          Learn more about our mission, vision, and the amazing team behind the
          LeishMan Network.
        </p>
      </div>
    </section>

    <!-- About Content Section -->
    <section class="py-12">
      <div class="grid gap-10 md:grid-cols-2 items-start">
        <!-- Text Content -->
        <div class="space-y-8">
          <div>
            <h2 class="font-display text-3xl text-slate-900 mb-3">{{ data.title1 }}</h2>
            <p class="text-slate-600 leading-relaxed">
            {{ data.description1 }}
            </p>
          </div>

          <div>
            <h2 class="font-display text-3xl text-slate-900 mb-3">{{ data.title2 }}</h2>
            <p class="text-slate-600 leading-relaxed">
            {{ data.description2 }}
            </p>
          </div>

          <div>
            <h2 class="font-display text-3xl text-slate-900 mb-3">{{ data.title3 }}</h2>
            <VueShowdown :markdown="data.description3" flavor="original" class="prose max-w-none text-slate-700" />
          </div>
        </div>

        <!-- Image or Milestone Section -->
        <div class="space-y-6">
          <img
            src="/assets/general/logo.webp"
            alt="About Us"
            class="w-full rounded-2xl border border-white/70 bg-white/80 p-4 shadow-lg"
          />
          <div>
            <h2 class="font-display text-3xl text-slate-900 mb-3">{{ data.title4 }}</h2>
            <p class="text-slate-600 leading-relaxed">
            {{ data.description4 }}
            </p>
          </div>
          <div>
            <h2 class="font-display text-3xl text-slate-900 mb-3">Consortium Agreement</h2>
            <a
              :href="data.manual_pdf"
              class="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
            >
              Download here
            </a>
          </div>
        </div>
      </div>
    </section>

    <!--
    <section class="py-16 bg-gray-100 px-10 dark:bg-gray-600">
      <div class="container mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Meet Our Team</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="member in team"
            :key="member.id"
            class="bg-white dark:bg-slate-300 p-6 rounded-lg shadow-md"
          >
            <img
              :src="member.image || placeholderImage"
              alt="Team Member"
              class="h-32 w-32 mx-auto rounded-full object-cover mb-4"
            />
            <h3 class="text-xl font-bold dark:text-gray-800">
              {{ member.name }}
            </h3>
            <p class="text-gray-600 dark:text-gray-800">{{ member.title }}</p>
          </div>
        </div>
      </div>
    </section>
     Team or Key Figures Section (Optional) -->
  </div>
</template>

<script setup>
import { VueShowdown } from "vue-showdown";
const placeholderImage = "placeholder.webp";
const team = ref([]);
// await queryContent("/about").findOne();
import { parse, stringify } from "yaml";
const data = ref([]);
onMounted(async () => {
  try {
    const aboutResponse = await fetch("/data/pages/about.yml");
    const aboutText = await aboutResponse.text();
    const aboutParse = parse(aboutText);
    data.value = aboutParse;
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});

onMounted(() => {
  team.value = [
    {
      id: 1,
      name: "Dr. Jane Doe",
      title: "Chief Scientist",
      image: "placeholder.webp",
    },
    {
      id: 2,
      name: "Dr. John Smith",
      title: "Researcher",
      image: "placeholder.webp",
    },
    {
      id: 3,
      name: "Dr. Emily Zhang",
      title: "Research Coordinator",
      image: "placeholder.webp",
    },
  ];
});
</script>

<style scoped></style>
