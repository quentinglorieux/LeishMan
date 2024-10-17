<template>
  <Titleheader title="Gallery"></Titleheader>

  <div class="row">
    <div v-for="im in images" class="column">
      <img :src="im" />
    </div>
  </div>
</template>
<script setup>
const ar = Array.from({ length: 41 }, (_, i) => i + 1);

var images = [];
for (const x of ar) {
  images.push("/images/eurk/image" + x + ".jpg");
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
