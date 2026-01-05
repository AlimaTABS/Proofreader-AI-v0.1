import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base path is essential for GitHub Pages sub-directory hosting
  base: './Proofreader-AI-v0.1', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
