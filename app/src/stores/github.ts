import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGitHubStore = defineStore('github', () => {
  const isConnected = ref(false);

  // Initialize from localStorage if available
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem('github_connected');
    if (savedState === 'true') {
      isConnected.value = true;
    }
  }

  function connect() {
    isConnected.value = true;
    if (typeof window !== 'undefined') {
      localStorage.setItem('github_connected', 'true');
    }
  }

  function disconnect() {
    isConnected.value = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('github_connected');
    }
  }

  return {
    isConnected,
    connect,
    disconnect,
  };
}); 