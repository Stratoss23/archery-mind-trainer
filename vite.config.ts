
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base must be relative './' to work on both GitHub Pages (subfolder) and local preview
  base: './', 
  define: {
    'process.env': {}
  }
});
