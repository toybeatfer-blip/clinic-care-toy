import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'https://clinic-care-toy.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
});
