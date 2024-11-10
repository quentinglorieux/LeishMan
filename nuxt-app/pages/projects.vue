<template>
  <section class="bg-pasteur-blue text-white py-16">
    <div class="container mx-auto text-center">
      <h1 class="text-4xl font-bold">Projects</h1>
    </div>
  </section>

  <div class="flex flex-wrap text-gray-800 dark:bg-slate-500 justify-around">
    <div v-for="(project, index) in projects">
      <div class="flip-card mx-20 mt-10">
        <h2 class="text-center uppercase">{{ project.title }}</h2>
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img
              :src="project.image"
              alt="Avatar"
              style="width: 300px; height: 300px"
            />
          </div>
          <div class="flip-card-back">
            {{ project.description }}
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- <div id="project" class="py-10 bg-white text-gray-800 dark:bg-slate-500">
    <div>
      <div class="md:w-9/12 mx-auto">
        <UCarousel
          v-slot="{ item, index }"
          :items="projectItems"
          width="300"
          height="400"
          draggable="false"
          :ui="{ item: 'basis-full md:basis-1/2 lg:basis-1/3' }"
          class="overflow-hidden p-10"
          indicators
        >
          <div class="text-center mx-auto">
            <div class="mt-1 mb-5">
              <h2 class="text-xl text-center font-bold">{{ item.title }}</h2>
            </div>
            <img
              :src="item.image"
              :alt="item.description"
              class="h-72 md:h-96 mx-auto"
              draggable="false"
              arrows
            />
          </div>
        </UCarousel>
      </div>
    </div>
  </div> -->
</template>

<script setup>
// const projectItems = ref([]);

const projects = await queryContent("projects").find();

// onMounted(async () => {
//   const response = await fetch("/data/events.json");
//   const data = await response.json();
//   projectItems.value = data.projects;
// });
</script>

<style scoped>
/* The flip card container - set the width and height to whatever you want. We have added the border property to demonstrate that the flip itself goes out of the box on hover (remove perspective if you don't want the 3D effect */
.flip-card {
  background-color: transparent;
  width: 300px;
  height: 300px;

  perspective: 1000px; /* Remove this if you don't want the 3D effect */
}

/* This container is needed to position the front and back side */
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

/* Do an horizontal flip when you move the mouse over the flip box container */
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}

/* Position the front and back side */
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden; /* Safari */
  backface-visibility: hidden;
}

/* Style the front side (fallback if image is missing) */
.flip-card-front {
  background-color: #bbb;
  color: black;
}

/* Style the back side */
.flip-card-back {
  background-color: #005a9c;
  color: white;
  transform: rotateY(180deg);
}
</style>
