import express from 'express';
import { config } from 'dotenv';
import { Client } from '@notionhq/client';
import cors from 'cors';

config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  NOTION_OAUTH_CLIENT_ID: clientId,
  NOTION_OAUTH_CLIENT_SECRET: clientSecret,
  NOTION_OAUTH_REDIRECT_URI: redirectUri
} = process.env;

const FRONTEND_URL = 'http://localhost:3000';

// Notion auth endpoint
app.get('/api/notion/auth', (req, res) => {
  if (!clientId || !redirectUri) {
    console.error('Missing required OAuth configuration');
    return res.redirect(`${FRONTEND_URL}/callback?error=missing_config`);
  }

  const state = Math.random().toString(36).substring(7);
  
  // Include all required scopes for reading content
  const scopes = [
    'read_user',
    'read_content',
    'read_database_content',
    'read_comment',
    'read_page_content'
  ].join(' '); // Use space separator as per OAuth 2.0 spec
  
  const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('owner', 'user');
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', scopes);

  console.log('Redirecting to Notion auth URL with scopes:', scopes);
  res.redirect(authUrl.toString());
});

// Notion callback endpoint
app.get('/api/notion/callback', async (req, res) => {
  const { code, error, state } = req.query;

  if (error) {
    console.error('OAuth error:', error);
    return res.redirect(`${FRONTEND_URL}/callback?error=${error}`);
  }

  if (!code || typeof code !== 'string') {
    console.error('No code received');
    return res.redirect(`${FRONTEND_URL}/callback?error=no_code`);
  }

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing OAuth configuration');
    return res.redirect(`${FRONTEND_URL}/callback?error=missing_config`);
  }

  try {
    console.log('Exchanging code for access token...');
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

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Token exchange failed:', data);
      throw new Error(data.error_description || 'Failed to get access token');
    }

    console.log('Successfully obtained access token');
    
    // Test the connection
    try {
      const notion = new Client({ auth: data.access_token });
      const user = await notion.users.me({});
      console.log('Successfully connected as user:', user.name);
      
      // Test page access
      const pages = await notion.search({
        filter: { property: 'object', value: 'page' }
      });
      console.log('Successfully fetched pages count:', pages.results.length);
    } catch (error) {
      console.error('Failed to verify token:', error);
      return res.redirect(`${FRONTEND_URL}/callback?error=token_verification_failed`);
    }
    
    // Redirect back to the frontend with the access token
    res.redirect(`${FRONTEND_URL}/callback?token=${data.access_token}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.redirect(`${FRONTEND_URL}/callback?error=auth_failed`);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 