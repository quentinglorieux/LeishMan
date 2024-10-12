<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-pasteur-blue text-white py-16">
      <div class="container mx-auto text-center">
        <h1 class="text-4xl font-bold">About Us</h1>
        <p class="mt-4 text-lg max-w-2xl mx-auto">
          Learn more about our mission, vision, and the amazing team behind the
          LeishMan Network.
        </p>
      </div>
    </section>

    <!-- About Content Section -->
    <section class="py-16">
      <div class="container mx-auto grid md:grid-cols-2 gap-8 px-10">
        <!-- Text Content -->
        <div>
          <h2 class="text-3xl font-bold mb-4">{{ data.title1 }}</h2>
          <p class="text-gray-700 dark:text-white leading-loose mb-6">
            {{ data.description1 }}
          </p>

          <h2 class="text-3xl font-bold mb-4">{{ data.title2 }}</h2>
          <p class="text-gray-700 dark:text-white leading-loose mb-6">
            {{ data.description2 }}
          </p>

          <h2 class="text-3xl font-bold mb-4">{{ data.title3 }}</h2>
          <VueShowdown :markdown="data.description3" flavor="original" />
        </div>

        <!-- Image or Milestone Section -->
        <div>
          <img
            src="/images/about-image.jpg"
            alt="About Us"
            class="rounded-lg shadow-lg mb-6"
          />
          <h2 class="text-3xl font-bold mb-4">{{ data.title4 }}</h2>
          <p class="text-gray-700 leading-loose dark:text-white">
            {{ data.description4 }}
          </p>
        </div>
      </div>
    </section>

    <!-- Team or Key Figures Section (Optional) -->
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
  </div>
</template>

<script setup>
import { VueShowdown } from "vue-showdown";
const placeholderImage = "/images/placeholder.jpg";
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
      image: "/images/noprofile.jpg",
    },
    {
      id: 2,
      name: "Dr. John Smith",
      title: "Researcher",
      image: "/images/noprofile.jpg",
    },
    {
      id: 3,
      name: "Dr. Emily Zhang",
      title: "Research Coordinator",
      image: "/images/noprofile.jpg",
    },
  ];
});
</script>

<style scoped></style>
