import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import type { UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()] as UserConfig['plugins'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
}); 