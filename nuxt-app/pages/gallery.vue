<template>
  <div>
    <!-- Hero Section -->

    <section class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/70 px-8 py-10 shadow-lg">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/15 via-cyan-500/10 to-transparent"></div>
      <div class="relative text-center">
        <h1 v-if="!isAuthenticated" class="text-4xl font-bold">
          Password Protected Page
        </h1>
        <h1 v-else class="font-display text-3xl sm:text-4xl">{{ page.title }}</h1>
        <p v-if="!isAuthenticated" class="mt-4 text-sm text-slate-600 max-w-2xl mx-auto">
          This page is protected. Please enter the password to proceed or
          contact us if you need access.
        </p>
        <a
          v-if="!isAuthenticated"
          href="/contact"
          class="mt-6 inline-block rounded-full bg-slate-900 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white"
        >
          Contact Support
        </a>
      </div>
    </section>

    <!-- Password Form Section -->
    <section class="py-12">
      <div
        v-if="isAuthenticated"
        class="mx-auto text-center rounded-[22px] border border-white/70 bg-white/80 p-8 shadow-lg"
      >
        <div>
          <div class="row">
            <div v-for="im in page.pictureList" class="column">
              <img :src="im.image" />
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="mx-auto max-w-lg text-center rounded-[22px] border border-white/70 bg-white/80 p-8 shadow-lg"
      >
        <div class="max-w-lg">
          <label for="password" class="block text-lg font-bold mb-2"
            >Enter Password:</label
          >
          <input
            type="password"
            v-model="password"
            @keyup.enter="checkPassword"
            class="w-full rounded-lg border border-slate-200 px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="checkPassword"
            class="w-full rounded-full bg-slate-900 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
          >
            Submit
          </button>
          <p v-if="errorMessage" class="text-red-500 mt-4">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const page = await queryCollection("gallery").first();

const password = ref("");
const isAuthenticated = ref(false);
const errorMessage = ref("");

const correctPassword = "leishman"; // Set your desired password here

const checkPassword = () => {
  if (password.value === correctPassword) {
    isAuthenticated.value = true;
    errorMessage.value = "";
  } else {
    errorMessage.value = "Incorrect password, please try again.";
  }
};
</script>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  padding: 0 4px;
}

/* Create four equal columns that sits next to each other */
.column {
  flex: 25%;
  max-width: 25%;
  padding: 0 4px;
}

.column img {
  margin-top: 8px;
  vertical-align: middle;
  width: 100%;
}

/* Responsive layout - makes a two column-layout instead of four columns */
@media screen and (max-width: 800px) {
  .column {
    flex: 50%;
    max-width: 50%;
  }
}

/* Responsive layout - makes the two columns stack on top of each other instead of next to each other */
@media screen and (max-width: 600px) {
  .column {
    flex: 100%;
    max-width: 100%;
  }
}
</style>
