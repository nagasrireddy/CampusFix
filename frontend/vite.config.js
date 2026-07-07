// ---------------------------------------------------------
// vite.config.js
// Standard Vite + React config. Dev server proxy forwards
// /api requests to the Express backend so the frontend can
// use relative paths in both dev and production builds.
// ---------------------------------------------------------

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
