import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

// Create app instance
const app = createApp(App);

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./views/Home.vue')
    },
    {
      path: '/callback',
      component: () => import('./views/Callback.vue')
    }
  ]
});

// Create store
const store = createPinia();

// Use plugins
app.use(router);
app.use(store);

// Mount app
app.mount('#app'); 