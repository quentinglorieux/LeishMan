<template>
  <div class="dark:bg-slate-600">
    <button v-if="colorMode.value == 'dark'" @click="changeColorMode">
      <UIcon name="material-symbols:nightlight"> </UIcon>
    </button>
    <button v-else @click="changeColorModeDark">
      <UIcon name="mdi:white-balance-sunny"> </UIcon>
    </button>
  </div>
</template>

<script setup>
const colorMode = useColorMode();
function changeColorMode() {
  colorMode.value = "light";
  colorMode.preference = "light";
}
function changeColorModeDark() {
  colorMode.value = "dark";
  colorMode.preference = "dark";
}
</script>

<style lang="postcss">
body {
  @apply min-h-screen  bg-gray-300/50 dark:bg-gray-800 dark:text-gray-200;
}

.checkbox {
  opacity: 0;
  position: absolute;
}

.checkbox-label {
  background-color: #111;
  width: 50px;
  height: 26px;
  border-radius: 50px;
  position: relative;
  padding: 5px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#moon {
  color: #f39c12;
}

#sun {
  color: #f1c40f;
}

.checkbox-label .ball {
  background-color: #fff;
  width: 22px;
  height: 22px;
  position: absolute;
  left: 2px;
  top: 2px;
  border-radius: 50%;
  transition: transform 0.2s linear;
}

.checkbox:checked + .checkbox-label .ball {
  transform: translateX(24px);
}

/*  Support me if you like it */
.support {
  position: absolute;
  right: 20px;
  bottom: 20px;
}

.support a {
  color: #292c35;
  font-size: 32px;
  backface-visibility: hidden;
  display: inline-block;
  transition: transform 0.2s ease;
}

.support a:hover {
  transform: scale(1.1);
}
</style>
