import { writable } from 'svelte/store';

const hasLocalStorage = typeof localStorage !== 'undefined';
const storedRole = hasLocalStorage ? localStorage.getItem('sveltia-cms.userRole') : null;

export const userRole = writable(storedRole);

userRole.subscribe((value) => {
  if (!hasLocalStorage) {
    return;
  }

  if (value) {
    localStorage.setItem('sveltia-cms.userRole', value);
  } else {
    localStorage.removeItem('sveltia-cms.userRole');
  }
});
