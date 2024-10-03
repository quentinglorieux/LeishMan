<template>
  <Titleheader title="Steering committee"></Titleheader>
  <section class="py-16 bg-gray-100 px-10">
    <div class="container mx-auto text-center">
      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="member in team"
          :key="member.id"
          class="bg-white p-6 rounded-lg shadow-md"
        >
          <img
            :src="member.image || placeholderImage"
            alt="Team Member"
            class="h-32 w-32 mx-auto rounded-full object-cover mb-4"
          />
          <h3 class="text-xl font-bold">{{ member.name }}</h3>
          <p class="text-gray-600">{{ member.role }}</p>
          <p>Contact : {{ member.email_adress }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const placeholderImage = "/images/placeholder.jpg";
const team = ref([]);

onMounted(async () => {
  try {
    const committeeResponse = await fetch("/data/committee.json");
    const committeeData = await committeeResponse.json();
    team.value = committeeData.members;
    console.log(team);
  } catch (error) {
    console.error("Error fetching news data:", error);
  }
});
</script>

<style scoped></style>
