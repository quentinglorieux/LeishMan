import { writable } from "svelte/store";

// Load the user role from localStorage (or default to null)
const storedRole = localStorage.getItem("sveltia-cms.userRole") || null;

// Create a reactive store
export const userRole = writable(storedRole);

// Sync changes to localStorage when updated
userRole.subscribe((value) => {
  if (value) {
    localStorage.setItem("sveltia-cms.userRole", value);
  } else {
    localStorage.removeItem("sveltia-cms.userRole");
  }
});