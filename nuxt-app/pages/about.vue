<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-pasteur-blue text-white py-16">
      <div class="container mx-auto text-center">
        <h1 class="text-4xl font-bold">About Us</h1>
        <p class="mt-4 text-lg max-w-2xl mx-auto">
          Learn more about our mission, vision, and the amazing team behind the
          Pasteur Network.
        </p>
      </div>
    </section>

    <!-- About Content Section -->
    <section class="py-16">
      <div class="container mx-auto grid md:grid-cols-2 gap-8">
        <!-- Text Content -->
        <div>
          <h2 class="text-3xl font-bold mb-4">Our Mission</h2>
          <p class="text-gray-700 leading-loose mb-6">
            The Pasteur Network connects a global community of researchers
            dedicated to promoting scientific excellence and fostering
            innovation to improve public health worldwide. Our mission is to
            bring together experts, share knowledge, and collaborate on
            groundbreaking research in the fields of virology, immunology, and
            more.
          </p>

          <h2 class="text-3xl font-bold mb-4">Our Vision</h2>
          <p class="text-gray-700 leading-loose mb-6">
            We envision a world where health threats are tackled with scientific
            rigor and cooperation, leading to innovative solutions for a
            healthier global community.
          </p>

          <h2 class="text-3xl font-bold mb-4">Our Values</h2>
          <ul class="list-disc pl-6 text-gray-700">
            <li>Collaboration and teamwork</li>
            <li>Innovation and creativity</li>
            <li>Scientific integrity</li>
            <li>Commitment to public health</li>
          </ul>
        </div>

        <!-- Image or Milestone Section -->
        <div>
          <img
            src="/images/about-image.jpg"
            alt="About Us"
            class="rounded-lg shadow-lg mb-6"
          />
          <h2 class="text-3xl font-bold mb-4">Our History</h2>
          <p class="text-gray-700 leading-loose">
            Established in 1887, the Pasteur Network has been a pioneer in
            scientific discoveries that have shaped the world. From
            breakthroughs in vaccination to disease control, we have always been
            at the forefront of medical research and innovation.
          </p>
        </div>
      </div>
    </section>

    <!-- Team or Key Figures Section (Optional) -->
    <section class="py-16 bg-gray-100">
      <div class="container mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Meet Our Team</h2>
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
            <p class="text-gray-600">{{ member.title }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const placeholderImage = "/images/placeholder.jpg";
const team = ref([]);

onMounted(() => {
  team.value = [
    {
      id: 1,
      name: "Dr. Jane Doe",
      title: "Chief Scientist",
      image: "/images/team1.jpg",
    },
    {
      id: 2,
      name: "Dr. John Smith",
      title: "Researcher",
      image: "/images/team2.jpg",
    },
    {
      id: 3,
      name: "Dr. Emily Zhang",
      title: "Research Coordinator",
      image: "/images/team3.jpg",
    },
  ];
});
</script>

<style scoped>
</style>
