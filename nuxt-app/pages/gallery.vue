<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-pasteur-blue text-white py-16">
      <div  class="container mx-auto text-center">
        <h1 v-if="!isAuthenticated" class="text-4xl font-bold">Password Protected Page</h1>
        <h1 v-else class="text-4xl font-bold">Gallery</h1>        
        <p v-if="!isAuthenticated" class="mt-4 text-lg max-w-2xl mx-auto">
          This page is protected. Please enter the password to proceed or contact us if you need access.
        </p>
        <a v-if="!isAuthenticated" href="/contact" class="mt-6 inline-block bg-white text-pasteur-blue hover:bg-gray-200 px-6 py-3 rounded-full font-bold">
          Contact Support
        </a>
      </div>
    </section>

    <!-- Password Form Section -->
    <section class="py-16 px-10">
      <div v-if="isAuthenticated" class=" mx-auto text-center bg-white p-10 rounded-lg shadow-lg">
        <div >
            <div class="row">
              <div v-for="im in images" class="column">
                <img :src="im" />
              </div>
            </div>
          </div>
          </div>
        <div v-else class=" mx-auto max-w-lg text-center bg-white p-10 rounded-lg shadow-lg">
        <div class="max-w-lg">
          <label for="password" class="block text-lg font-bold mb-2">Enter Password:</label>
          <input
            type="password"
            v-model="password"
            @keyup.enter="checkPassword"
            class="border border-gray-300 rounded-lg w-full px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pasteur-blue"
          />
          <button
            @click="checkPassword"
            class="bg-pasteur-blue hover:bg-pasteur-dark text-white font-bold py-2 px-4 rounded-full w-full"
          >
            Submit
          </button>
          <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
    const ar = Array.from({ length: 41 }, (_, i) => i + 1);

    var images = [];
    for (const x of ar) {
      images.push("/images/gallery/image" + x + ".jpg");
    }
    
    const password = ref('')
    const isAuthenticated = ref(false)
    const errorMessage = ref('')
    
    const correctPassword = 'leishman' // Set your desired password here
    
    const checkPassword = () => {
      if (password.value === correctPassword) {
        isAuthenticated.value = true
        errorMessage.value = ''
      } else {
        errorMessage.value = 'Incorrect password, please try again.'
      }
    }
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