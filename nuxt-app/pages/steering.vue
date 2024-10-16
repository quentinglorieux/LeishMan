<template>
        <section class="bg-pasteur-blue text-white py-16">
      <div class="container mx-auto text-center">
        <h1 class="text-4xl font-bold">Our steering committee</h1>

      </div>
    </section>

  <section class="py-16 bg-gray-100 px-10 dark:bg-slate-600">
    <div class="container mx-auto text-center">
      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="member in team"
          :key="member.id"
          class="bg-white dark:bg-gray-600 p-6 rounded-lg shadow-md"
        >
          <img
            :src="member.image || placeholderImage"
            alt="Team Member"
            class="h-32 w-32 mx-auto rounded-full object-cover object-top mb-4"
          />
          <h3 class="text-xl font-bold dark:text-gray-100">
            {{ member.name }}
          </h3>
          <p class="text-gray-600 dark:text-gray-100">{{ member.role }}</p>
          <p class="dark:text-gray-100 ">Contact : {{ member.email_adress }}</p>

          <UAccordion
          class="mt-4 dark:text-gray-100"
          color="gray"
          variant="solid"
          size="md"
          open-icon="i-heroicons-plus"
        close-icon="i-heroicons-minus"
           :items="[{ label: 'Short biography', content:  member.bio  }]"
          />


        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const placeholderImage = "/images/placeholder.webp";
const team = ref([]);

onMounted(async () => {
  try {
    const committeeResponse = await fetch("/data/committee.json");
    const committeeData = await committeeResponse.json();
    team.value = committeeData.members;
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});
</script>

<style scoped></style>
