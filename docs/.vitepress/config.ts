import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NotionDocs',
  description: 'Convert your Notion wiki to a VitePress site',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Introduction', link: '/guide/' }
        ]
      }
    ]
  }
}) 