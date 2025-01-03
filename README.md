# Ezdocs

Convert your Notion wiki into a beautiful VitePress documentation site.

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/matanfield/ezdocs.git
cd ezdocs
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Notion OAuth credentials:
```env
NOTION_OAUTH_CLIENT_ID=your_client_id
NOTION_OAUTH_CLIENT_SECRET=your_client_secret
NOTION_OAUTH_REDIRECT_URI=http://localhost:3001/api/notion/callback
```

4. Start the development servers:
```bash
# Terminal 1: Start the API server
npm run server

# Terminal 2: Start the Vue development server
npm run dev
```

5. Open http://localhost:3000 in your browser

## Development

- Frontend: Vue 3 + Vite
- Backend: Express + TypeScript
- Documentation: VitePress
- Authentication: Notion OAuth 2.0

## Project Structure

```
notiondocs/
├── app/                    # Frontend application
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── services/      # API services
│   │   ├── stores/        # Pinia stores
│   │   └── views/         # Vue views
├── docs/                   # VitePress documentation
├── scripts/               # Utility scripts
└── server.ts              # Express API server
```


## Overview

NotionDocs is a mini app that reads a Notion wiki and converts it to a Vitepress site.


### Step 0 - sign-up or login -> implement later
- sign-up or login with github


### Step 1 - scafolding

- launch a placeholder Vitepress site locally - done once
- connect to github repo - done once

### Step 2 - connect to Notion
- connect to a Notion workspace and wiki via Notion's auth flow UI - done once
- choose Wiki to read and sync from


### Step 3 - read and update

- read the wiki and create/update the corresponding folder structure in the placeholder Vitepress site locally
- read the wiki, export all of its pages, convert them into markdown files and place them in the corresponding folder structure locally
- push changes to github
- re-serve the site locally

### Step 4 - deploy

- upon viewing the site, user approves flow to deploy to Vercel
- deploy the site to a static site hosted with Vercel


User runs script 1 and 2 once, then makes iterations over the wiki in Notion and running script 3, and then runs script 4 to deploy the site to Vercel.


## Minimal tech stack

- VitePress: Generates and serves the docs.
- Notion SDK: For connecting to Notion’s API.
- Vercel: For deployment.
- Github: For version contol.
- Vercel: For deployment.


## App screen
- One-page setting


## Implementation Steps

1. Project Setup - DONE
[x] Initialize a Node project: npm init -y
[x] Install VitePress, Notion SDK, etc. (npm install vitepress notion)
[x] Create basic folder structure: scripts/, docs/ for VitePress, etc.

2. Script 1: Scaffold & Connect to GitHub - DONE
[x] Generate a minimal VitePress config in docs/.vitepress/config.js
[x] Add placeholder pages in docs/
[x] Commit and push to a new GitHub repo.

3. Script 2: Connect to Notion - doing next
[ ] Implement Notion’s OAuth: store credentials/token in a .env file or config.
[ ] Once authorized, you can query for pages in a target wiki.

4. Script 3: Read & Update
[ ] Query Notion pages.
[ ] Convert each page to Markdown, place them in the corresponding folders in docs/.
[ ] Update docs/.vitepress/config.js for the new pages.
- Commit changes, push to GitHub, and re-serve VitePress locally (e.g. vitepress dev).

5. Script 4: Deploy
- On user approval, trigger Vercel deployment from the GitHub repo.
- Verify the deployed URL on Vercel.

Then iterate: update Notion, run Script 3, see changes, deploy with Script 4.


## Application States

The application follows a specific state flow as users progress through the wiki conversion process:

### 1. Initial State
- GitHub: Disconnected
- Notion: Disconnected
- Selected Wiki: None
- Sync Status: Not started
- Deploy Status: Not started

### 2. GitHub Connected State
- GitHub: Connected
- Notion: Disconnected
- Selected Wiki: None
- Sync Status: Not started
- Deploy Status: Not started

### 3. Notion Connected State
- GitHub: Connected
- Notion: Connected
- Pages: Loading/Loaded
- Selected Wiki: None
- Sync Status: Not started
- Deploy Status: Not started

### 4. Wiki Selected State
- GitHub: Connected
- Notion: Connected
- Pages: Loaded
- Selected Wiki: Specific page selected
- Sync Status: Ready
- Deploy Status: Not started

### 5. Syncing State
- GitHub: Connected
- Notion: Connected
- Pages: Loaded
- Selected Wiki: Specific page selected
- Sync Status: In Progress
- Deploy Status: Not started

### 6. Synced State
- GitHub: Connected
- Notion: Connected
- Pages: Loaded
- Selected Wiki: Specific page selected
- Sync Status: Completed
- Deploy Status: Ready

### 7. Deploying State
- GitHub: Connected
- Notion: Connected
- Pages: Loaded
- Selected Wiki: Specific page selected
- Sync Status: Completed
- Deploy Status: In Progress

### 8. Deployed State
- GitHub: Connected
- Notion: Connected
- Pages: Loaded
- Selected Wiki: Specific page selected
- Sync Status: Completed
- Deploy Status: Completed

Each state represents a specific point in the conversion process, with clear prerequisites and conditions for moving to the next state. The application maintains these states to ensure a proper flow and to prevent invalid operations.


