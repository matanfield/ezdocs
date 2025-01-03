<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-12">Convert your Notion Wiki to VitePress</h1>
    
    <!-- Error Alert -->
    <div v-if="error" class="max-w-2xl mx-auto mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      <span class="block sm:inline">{{ error }}</span>
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="error = ''">
        <svg class="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
        </svg>
      </span>
    </div>
    
    <div class="max-w-2xl mx-auto space-y-8">
      <!-- Step 1: GitHub Connection -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Step 1: Connect to GitHub</h2>
        <button 
          @click="connectGitHub" 
          :class="[
            'px-4 py-2 rounded-md w-full',
            githubStore.isConnected 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          ]"
          :disabled="githubStore.isConnected"
        >
          {{ githubStore.isConnected ? 'Connected to GitHub' : 'Connect to GitHub' }}
        </button>
      </div>

      <!-- Step 2: Notion Connection -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Step 2: Connect to Notion</h2>
        <button 
          @click="connectNotion"
          :class="[
            'px-4 py-2 rounded-md w-full mb-4',
            notionStore.isConnected
              ? 'bg-green-500 text-white' 
              : notionStore.isConnecting
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
          ]"
          :disabled="!githubStore.isConnected || notionStore.isConnected || notionStore.isConnecting"
        >
          {{ 
            notionStore.isConnected 
              ? 'Connected to Notion' 
              : notionStore.isConnecting
                ? 'Connecting to Notion...'
                : 'Connect to Notion' 
          }}
        </button>

        <!-- Wiki Selection - Always visible -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Select Wiki to Sync
          </label>
          <div v-if="isLoadingPages" class="flex items-center justify-center py-4 space-x-2">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span class="text-sm text-gray-600">Loading pages...</span>
          </div>
          <select 
            v-else
            v-model="notionStore.selectedPageId"
            class="w-full border border-gray-300 rounded-md px-3 py-2"
            :class="{ 
              'text-gray-500': !notionStore.isConnected || notionStore.pages.length === 0,
              'bg-gray-100': !notionStore.isConnected
            }"
            :disabled="!notionStore.isConnected"
          >
            <option value="" disabled>
              {{ getDropdownPlaceholder }}
            </option>
            <template v-if="notionStore.pages.length > 0">
              <option v-for="page in notionStore.pages" :key="page.id" :value="page.id">
                {{ page.title }}
              </option>
            </template>
          </select>
          
          <!-- Status Messages -->
          <div class="mt-2">
            <!-- Not Connected Message -->
            <p v-if="!notionStore.isConnected" class="text-sm text-gray-600">
              Connect to Notion to select a wiki
            </p>

            <!-- Error Message -->
            <p v-else-if="notionStore.error" class="text-sm text-red-600">
              {{ notionStore.error }}
              <button 
                @click="retryFetchPages" 
                class="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Retry
              </button>
            </p>
            
            <!-- No Pages Message -->
            <p v-else-if="notionStore.isConnected && notionStore.pages.length === 0" class="text-sm text-gray-600">
              No pages found in your Notion workspace.
              <button 
                @click="retryFetchPages" 
                class="ml-2 text-blue-600 hover:text-blue-800 underline"
              >
                Refresh
              </button>
            </p>
          </div>
        </div>
      </div>

      <!-- Step 3: Sync -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Step 3: Sync Content</h2>
        <button 
          @click="syncContent"
          :class="[
            'px-4 py-2 rounded-md w-full',
            isSyncing ? 'bg-yellow-500' : 'bg-blue-500 hover:bg-blue-600',
            'text-white'
          ]"
          :disabled="!notionStore.isConnected || !notionStore.selectedPageId || isSyncing"
        >
          {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
        </button>
      </div>

      <!-- Step 4: Deploy -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Step 4: Deploy Site</h2>
        <button 
          @click="deploySite"
          class="px-4 py-2 rounded-md w-full bg-blue-500 hover:bg-blue-600 text-white"
          :disabled="!notionStore.isConnected || !notionStore.selectedPageId"
        >
          Deploy to Vercel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useNotionStore } from '../stores/notion';
import { useGitHubStore } from '../stores/github';
import { useRoute } from 'vue-router';

const route = useRoute();
const notionStore = useNotionStore();
const githubStore = useGitHubStore();

// State
const isSyncing = ref(false);
const isLoadingPages = ref(false);
const error = ref('');

// Computed
const getDropdownPlaceholder = computed(() => {
  if (!notionStore.isConnected) {
    return 'Connect to Notion first';
  }
  if (isLoadingPages.value) {
    return 'Loading pages...';
  }
  if (notionStore.error) {
    return 'Error loading pages';
  }
  if (notionStore.pages.length === 0) {
    return 'No pages available';
  }
  return 'Select a wiki...';
});

// Actions
const connectGitHub = async () => {
  // TODO: Implement GitHub OAuth flow
  githubStore.connect();
};

const connectNotion = async () => {
  error.value = '';
  try {
    await notionStore.connect();
  } catch (err) {
    console.error('Failed to connect to Notion:', err);
    error.value = 'Failed to connect to Notion. Please try again.';
  }
};

const retryFetchPages = async () => {
  error.value = '';
  isLoadingPages.value = true;
  try {
    await notionStore.fetchPages();
  } catch (err) {
    console.error('Failed to fetch pages:', err);
    error.value = 'Failed to fetch Notion pages. Please try again.';
  } finally {
    isLoadingPages.value = false;
  }
};

const syncContent = async () => {
  if (!notionStore.selectedPageId) return;
  
  isSyncing.value = true;
  try {
    // TODO: Implement sync logic
    await new Promise(resolve => setTimeout(resolve, 2000)); // Mock sync delay
  } catch (err) {
    error.value = 'Failed to sync content. Please try again.';
  } finally {
    isSyncing.value = false;
  }
};

const deploySite = async () => {
  // TODO: Implement Vercel deployment
};

// Watch for Notion connection state changes
watch(() => notionStore.isConnected, async (isConnected) => {
  console.log('Notion connection state changed:', isConnected);
  if (isConnected) {
    isLoadingPages.value = true;
    error.value = ''; // Clear any previous errors
    try {
      console.log('Fetching Notion pages...');
      await notionStore.fetchPages();
      console.log('Fetched pages:', notionStore.pages);
    } catch (err) {
      console.error('Failed to fetch pages:', err);
      error.value = 'Failed to fetch Notion pages. Please try reconnecting.';
      notionStore.disconnect(); // Disconnect on error
    } finally {
      isLoadingPages.value = false;
    }
  } else {
    // Reset state when disconnected
    notionStore.selectedPageId = '';
    error.value = '';
  }
});

// Handle component mount
onMounted(async () => {
  console.log('Home component mounted');
  console.log('Current Notion connection state:', notionStore.isConnected);
  
  // Check for error parameter
  const errorParam = route.query.error as string;
  if (errorParam) {
    error.value = `Authentication failed: ${errorParam}`;
    notionStore.disconnect(); // Ensure we're disconnected on error
    return;
  }

  // If we're already connected to Notion, fetch the pages
  if (notionStore.isConnected) {
    isLoadingPages.value = true;
    error.value = ''; // Clear any previous errors
    try {
      await notionStore.fetchPages();
    } catch (err) {
      console.error('Failed to fetch pages:', err);
      error.value = 'Failed to fetch Notion pages. Please try reconnecting.';
      notionStore.disconnect(); // Disconnect on error
    } finally {
      isLoadingPages.value = false;
    }
  }
});
</script> 