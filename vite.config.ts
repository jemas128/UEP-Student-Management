import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This ensures your app works in a subfolder or on shared hosting
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Ensure small assets aren't inlined as base64, forcing them into the assets folder
    assetsInlineLimit: 0, 
  }
});