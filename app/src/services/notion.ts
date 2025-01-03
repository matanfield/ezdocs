import { Client } from '@notionhq/client';

export interface NotionPage {
  id: string;
  title: string;
  url: string;
}

class NotionService {
  private client: Client | null = null;

  async authenticate(): Promise<void> {
    console.log('Starting Notion authentication...');
    // This will trigger the OAuth flow through our API server
    window.location.href = 'http://localhost:3001/api/notion/auth';
  }

  async initialize(token: string): Promise<void> {
    console.log('Initializing Notion client...');
    if (!token) {
      console.error('No token provided for initialization');
      throw new Error('No token provided');
    }

    try {
      this.client = new Client({ auth: token });
      // Test the connection
      const user = await this.client.users.me({});
      console.log('Notion client initialized successfully for user:', user.name);
    } catch (error) {
      console.error('Failed to initialize Notion client:', error);
      this.client = null;
      throw error;
    }
  }

  async getPages(): Promise<NotionPage[]> {
    console.log('Fetching Notion pages...');
    if (!this.client) {
      console.error('Cannot fetch pages: Notion client not initialized');
      throw new Error('Notion client not initialized');
    }

    try {
      const response = await this.client.search({
        filter: {
          property: 'object',
          value: 'page'
        }
      });

      const pages = response.results.map((page: any) => ({
        id: page.id,
        title: page.properties?.title?.title?.[0]?.plain_text || 
               page.properties?.Name?.title?.[0]?.plain_text ||
               page.url.split('/').pop() || 
               'Untitled',
        url: page.url
      }));

      console.log(`Successfully fetched ${pages.length} pages`);
      return pages;
    } catch (error) {
      console.error('Failed to fetch Notion pages:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

export const notionService = new NotionService(); 