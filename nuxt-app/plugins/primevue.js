import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Paginator from 'primevue/paginator';

export default defineNuxtPlugin((nuxtApp) => {
  // Tell Nuxt to use PrimeVue for the Vue app
  nuxtApp.vueApp.use(PrimeVue);

  // Register PrimeVue components globally
  nuxtApp.vueApp.component('Button', Button);
  nuxtApp.vueApp.component('DataTable', DataTable);
  nuxtApp.vueApp.component('Column', Column);
  nuxtApp.vueApp.component('InputText', InputText);
  nuxtApp.vueApp.component('Dropdown', Dropdown);
  nuxtApp.vueApp.component('Paginator', Paginator);
});
