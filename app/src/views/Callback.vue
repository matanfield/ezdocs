<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <h2 class="text-xl font-semibold mb-4">Processing Notion Authorization...</h2>
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-sm text-gray-600 mt-4">{{ status }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotionStore } from '../stores/notion';
import { useGitHubStore } from '../stores/github';

const router = useRouter();
const notionStore = useNotionStore();
const githubStore = useGitHubStore();
const status = ref('Initializing...');

onMounted(async () => {
  try {
    console.log('Callback mounted, checking URL parameters...');
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    console.log('Token:', token ? 'Present' : 'Not present');
    console.log('Error:', error);
    console.log('GitHub connected:', githubStore.isConnected);
    console.log('Current Notion connection state:', notionStore.isConnected);

    if (token) {
      status.value = 'Initializing Notion...';
      console.log('Initializing Notion with token...');
      try {
        await notionStore.initialize(token);
        console.log('Notion initialized successfully');
        console.log('New Notion connection state:', notionStore.isConnected);
        console.log('Pages loaded:', notionStore.pages.length);
        
        status.value = 'Connected successfully!';
        // Add a small delay to show the success message
        await new Promise(resolve => setTimeout(resolve, 1000));
        await router.push('/');
      } catch (err) {
        console.error('Failed to initialize Notion:', err);
        status.value = 'Failed to initialize Notion';
        await router.push('/?error=initialization_failed');
      }
    } else if (error) {
      console.error('Auth error:', error);
      status.value = 'Authentication failed';
      await router.push(`/?error=${error}`);
    } else {
      console.log('No token or error found, redirecting to home');
      status.value = 'No authorization data found';
      await router.push('/');
    }
  } catch (err) {
    console.error('Unexpected error in callback:', err);
    status.value = 'An unexpected error occurred';
    await router.push('/?error=unexpected_error');
  }
});
</script> 