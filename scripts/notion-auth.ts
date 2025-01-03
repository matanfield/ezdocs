import { Client } from '@notionhq/client';
import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { writeFileSync } from 'fs';
import { join } from 'path';
import open from 'open';

// Load environment variables
config();

const {
  NOTION_OAUTH_CLIENT_ID: clientId,
  NOTION_OAUTH_CLIENT_SECRET: clientSecret,
  NOTION_OAUTH_REDIRECT_URI: redirectUri
} = process.env;

if (!clientId || !clientSecret || !redirectUri) {
  console.error(`
Error: Missing Notion OAuth configuration

To set up public Notion integration:
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "NotionDocs"
4. Choose "Public integration"
5. Under "OAuth Domain & URIs":
   - Add your domain (for development: localhost)
   - Add redirect URI: ${redirectUri || 'http://localhost:3000/callback'}
6. Copy the OAuth client ID and client secret
7. Add them to your .env file as:
   NOTION_OAUTH_CLIENT_ID=xxx
   NOTION_OAUTH_CLIENT_SECRET=xxx
   NOTION_OAUTH_REDIRECT_URI=${redirectUri || 'http://localhost:3000/callback'}
`);
  process.exit(1);
}

interface NotionOAuthResponse {
  access_token: string;
  bot_id: string;
  duplicated_template_id: string | null;
  owner: {
    workspace: boolean;
    user: {
      id: string;
      name: string;
    };
  };
  workspace_id: string;
  workspace_name: string;
  workspace_icon: string | null;
}

/**
 * Handles Notion OAuth flow for public integration
 */
async function setupNotionAuth() {
  const app = express();
  let server: ReturnType<typeof app.listen>;

  return new Promise((resolve, reject) => {
    app.get('/callback', async (req: Request, res: Response) => {
      const { code, error, state } = req.query;

      if (error) {
        console.error('OAuth error:', error);
        res.send('Authentication failed. Please check the console for more details.');
        reject(error);
        return;
      }

      if (!code || typeof code !== 'string') {
        console.error('No code received');
        res.send('No authorization code received.');
        reject(new Error('No code received'));
        return;
      }

      try {
        // Exchange the authorization code for an access token
        const response = await fetch('https://api.notion.com/v1/oauth/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri
          })
        });

        const data = await response.json() as NotionOAuthResponse;

        if (!response.ok) {
          throw new Error(data.access_token || 'Failed to get access token');
        }

        // Save the configuration
        const envPath = join(process.cwd(), '.env');
        const envContent = `
# GitHub configuration
GITHUB_TOKEN=${process.env.GITHUB_TOKEN || ''}
GITHUB_USERNAME=${process.env.GITHUB_USERNAME || ''}

# Notion OAuth configuration
NOTION_OAUTH_CLIENT_ID=${clientId}
NOTION_OAUTH_CLIENT_SECRET=${clientSecret}
NOTION_OAUTH_REDIRECT_URI=${redirectUri}

# Notion workspace configuration
NOTION_ACCESS_TOKEN=${data.access_token}
NOTION_WORKSPACE_ID=${data.workspace_id}
NOTION_WORKSPACE_NAME=${data.workspace_name}`;

        writeFileSync(envPath, envContent.trim());

        // Test the connection
        const notion = new Client({ auth: data.access_token });
        const user = await notion.users.me({});

        res.send('Authentication successful! You can close this window.');
        console.log('\nSuccessfully connected to Notion workspace:', data.workspace_name);
        console.log('Workspace ID:', data.workspace_id);
        console.log('User:', user.name);
        
        // Close the server
        server.close(() => {
          resolve(data);
        });
      } catch (error) {
        console.error('Error exchanging code for token:', error);
        res.send('Error getting access token. Please check the console for more details.');
        reject(error);
      }
    });

    // Start the server
    server = app.listen(3000, () => {
      console.log('Starting Notion OAuth flow...');
      
      // Generate the OAuth URL with all required scopes
      const scopes = [
        'read_user',
        'read_content',
        'read_database_content',
        'read_comment'
      ].join(',');
      
      // Ensure redirectUri is defined
      const finalRedirectUri = redirectUri || 'http://localhost:3000/callback';
      
      const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(finalRedirectUri)}&scope=${scopes}`;
      
      console.log('Opening browser for authentication...');
      console.log('Auth URL:', authUrl);
      open(authUrl);
    });
  });
}

// Run the auth flow
setupNotionAuth().catch(console.error); 