import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // IMPORTANT: Configuration pour le router SPA
  preview: {
    port: 5173,
    strictPort: false,
    host: true
  }
});