import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { Octokit } from 'octokit';

// Load environment variables
config();

const { GITHUB_TOKEN, GITHUB_USERNAME } = process.env;

if (!GITHUB_TOKEN || !GITHUB_USERNAME) {
  console.error('Error: GITHUB_TOKEN and GITHUB_USERNAME must be set in .env file');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

/**
 * Creates a new GitHub repository
 */
async function createGitHubRepo(repoName: string) {
  try {
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'Documentation site generated from Notion wiki using NotionDocs',
      private: false,
      has_issues: true,
      has_projects: false,
      has_wiki: false,
      auto_init: false
    });

    return response.data.html_url;
  } catch (error: any) {
    if (error.status === 422) {
      console.log('Repository already exists, attempting to use it...');
      return `https://github.com/${GITHUB_USERNAME}/${repoName}`;
    }
    throw error;
  }
}

/**
 * Initializes and configures the GitHub repository for NotionDocs
 */
async function scaffoldGitHub() {
  try {
    const repoName = 'notiondocs-site'; // You can make this configurable if needed
    
    // Check if git is already initialized
    const isGitInitialized = existsSync(join(process.cwd(), '.git'));
    
    if (!isGitInitialized) {
      console.log('Initializing Git repository...');
      execSync('git init');
      execSync('git add .');
      execSync('git commit -m "Initial commit: NotionDocs setup"');
    } else {
      console.log('Git repository already initialized.');
    }

    console.log('Creating GitHub repository...');
    const repoUrl = await createGitHubRepo(repoName);
    
    // Add remote and push
    try {
      execSync('git remote add origin ' + repoUrl + '.git');
    } catch (error) {
      console.log('Remote already exists, updating URL...');
      execSync('git remote set-url origin ' + repoUrl + '.git');
    }

    console.log('Pushing to GitHub...');
    execSync('git push -u origin main || git push -u origin master');
    
    console.log('GitHub scaffold completed successfully!');
    console.log('Repository URL:', repoUrl);
    
  } catch (error) {
    console.error('Error during GitHub scaffold:', error);
    process.exit(1);
  }
}

// Run the scaffold process
scaffoldGitHub(); 