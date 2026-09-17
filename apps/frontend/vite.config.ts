import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootNodeModules = path.resolve(__dirname, '../../node_modules');

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] as ('console' | 'debugger')[] } : undefined,
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      react: path.resolve(rootNodeModules, 'react'),
      'react-dom': path.resolve(rootNodeModules, 'react-dom'),
      'react-dom/client': path.resolve(rootNodeModules, 'react-dom/client.js'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  build: {
    // Enable CSS code splitting — loads only the CSS needed per route
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting to minimise initial JS parse time (↓ INP / TBT).
         *
         * Strategy:
         *  - vendor        → React + ReactDOM (always cached, rarely changes)
         *  - router        → react-router-dom (rarely changes)
         *  - query         → @tanstack/react-query (rarely changes)
         *  - motion        → framer-motion (animation, heavy, defer where possible)
         *  - ui            → lucide icons + class utilities
         *  - app           → everything else (changes most often)
         */
        manualChunks(id) {
          // React core — smallest possible initial bundle
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor';
          }
          // Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'router';
          }
          // Data fetching
          if (id.includes('node_modules/@tanstack/')) {
            return 'query';
          }
          // Animation (largest single dep — split so homepage doesn't pay for it)
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          // Icon library
          if (id.includes('node_modules/lucide-react')) {
            return 'ui';
          }
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
}));
