<template>
  <div class="container mx-auto py-4">
    <div v-if="normalizedProgram.length > 0">
      <div v-for="(item, index) in normalizedProgram" :key="index" class="mb-6">
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2">{{ item.session }}</h2>
            <p class="text-gray-600">Time: {{ item.starttime }}</p>
            <p class="text-gray-600">
              Speaker: <span class="font-semibold">{{ item.speaker || "—" }}</span>
            </p>

            <!-- Display topic as a chip -->
            <UBadge
              class="mt-2"
              size="sm"
              variant="solid"
              :color="getTopicColor(item.topic)"
            >
              {{ item.topic || "General" }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p></p>
    </div>
  </div>
</template>

<script setup>
// Define props to receive the program data
import { computed } from "vue";

const props = defineProps({
  programData: {
    type: [Array, Object, String],
    default: () => [],
  },
});

const normalizedProgram = computed(() => {
  if (Array.isArray(props.programData)) return props.programData;
  if (props.programData && typeof props.programData === "object") return [props.programData];
  return [];
});

// Function to assign colors based on the topic
const getTopicColor = (topic) => {
  if (!topic || typeof topic !== "string") return "gray";
  switch (topic.toUpperCase()) {
    case "COMMON \nASPECTS":
      return "sky";
    case "EPIDEMIOLOGY":
      return "green";
    case "DIAGNOSIS \nAND \nPARASITES":
      return "teal";
    case "THERAPEUTICS":
      return "orange";
    case "CLINICAL CASES":
      return "indigo";
    default:
      return "gray"; // Fallback color if topic not matched
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
