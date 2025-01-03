import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notionService, type NotionPage } from '../services/notion';

export const useNotionStore = defineStore('notion', () => {
  // State
  const isConnected = ref(false);
  const isConnecting = ref(false);
  const pages = ref<NotionPage[]>([]);
  const selectedPageId = ref<string>('');
  const accessToken = ref<string | null>(null);
  const error = ref<string | null>(null);

  // Initialize from localStorage if available
  if (typeof window !== 'undefined') {
    const savedToken = localStorage.getItem('notion_token');
    if (savedToken) {
      console.log('Found saved Notion token, initializing...');
      accessToken.value = savedToken;
      // Initialize Notion service with saved token
      notionService.initialize(savedToken)
        .then(() => {
          console.log('Successfully initialized from saved token');
          isConnected.value = true;
          // Fetch pages after successful initialization
          fetchPages().catch(console.error);
        })
        .catch((err) => {
          console.error('Failed to initialize from saved token:', err);
          // Clear invalid token
          disconnect();
        });
    }
  }

  async function connect() {
    console.log('Connecting to Notion...');
    isConnecting.value = true;
    error.value = null;
    
    try {
      await notionService.authenticate();
    } catch (err) {
      console.error('Failed to connect to Notion:', err);
      error.value = 'Failed to connect to Notion';
      isConnecting.value = false;
      throw err;
    }
  }

  async function initialize(token: string) {
    console.log('Initializing Notion with token...');
    isConnecting.value = true;
    error.value = null;
    
    try {
      await notionService.initialize(token);
      console.log('Notion service initialized');
      
      accessToken.value = token;
      isConnected.value = true;
      
      // Save token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('notion_token', token);
      }
      
      console.log('Notion initialized, fetching pages...');
      await fetchPages();
      console.log('Initialization complete. Connection state:', isConnected.value);
    } catch (err) {
      console.error('Failed to initialize Notion:', err);
      error.value = 'Failed to initialize Notion';
      disconnect();
      throw err;
    } finally {
      isConnecting.value = false;
    }
  }

  async function fetchPages() {
    console.log('Fetching Notion pages...');
    if (!isConnected.value || !accessToken.value) {
      console.error('Cannot fetch pages: Not connected to Notion');
      throw new Error('Not connected to Notion');
    }

    try {
      const fetchedPages = await notionService.getPages();
      pages.value = fetchedPages;
      console.log('Successfully fetched pages:', pages.value.length);
      return fetchedPages;
    } catch (err) {
      console.error('Failed to fetch pages:', err);
      error.value = 'Failed to fetch pages';
      throw err;
    }
  }

  function selectPage(pageId: string) {
    console.log('Selecting page:', pageId);
    selectedPageId.value = pageId;
  }

  function disconnect() {
    console.log('Disconnecting from Notion...');
    isConnected.value = false;
    isConnecting.value = false;
    pages.value = [];
    selectedPageId.value = '';
    accessToken.value = null;
    error.value = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('notion_token');
    }
  }

  return {
    // State
    isConnected,
    isConnecting,
    pages,
    selectedPageId,
    error,
    // Actions
    connect,
    initialize,
    fetchPages,
    selectPage,
    disconnect,
  };
}); 