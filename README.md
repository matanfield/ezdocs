# NotionDocs

NotionDocs is a mini app that reads a Notion wiki and converts it to a Vitepress site.


## Script 1 - scafolding

- launch a placeholder Vitepress site locally - done once
- connect to github repo - done once

## Script 2 - connect to Notion
- connect to a Notion workspace and wiki via Notion's auth flow UI - done once


## Script 3 - read and update

- read the wiki and create/update the corresponding folder structure in the placeholder Vitepress site locally
- read the wiki, export all of its pages, convert them into markdown files and place them in the corresponding folder structure locally
- push changes to github
- re-serve the site locally

## Script 4 - deploy

- upon viewing the site, user approves flow to deploy to Vercel
- deploy the site to a static site hosted with Vercel


User runs script 1 and 2 once, then makes iterations over the wiki in Notion and running script 3, and then runs script 4 to deploy the site to Vercel.
