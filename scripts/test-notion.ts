import { Client } from '@notionhq/client';
import { config } from 'dotenv';

// Load environment variables
config();

const notion = new Client({ auth: process.env.NOTION_ACCESS_TOKEN });

async function testNotionAccess() {
  try {
    // Test 1: Verify user access
    const user = await notion.users.me({});
    console.log('\nTest 1 - User Access:');
    console.log('Connected as:', user.name);

    // Test 2: List all accessible pages
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'page'
      }
    });

    console.log('\nTest 2 - Accessible Pages:');
    console.log('Found', response.results.length, 'pages');
    
    response.results.forEach((page: any) => {
      console.log('-', page.url);
    });

  } catch (error) {
    console.error('Error accessing Notion:', error);
  }
}

// Run the test
testNotionAccess(); 