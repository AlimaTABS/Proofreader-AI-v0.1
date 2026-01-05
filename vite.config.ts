import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This ensures assets work when deployed to a sub-path (like username.github.io/repo-name)
  base: './', 
});