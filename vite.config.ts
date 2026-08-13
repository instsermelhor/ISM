/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // React ecosystem (react, react-dom, scheduler, react-is)
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/') ||
            id.includes('/react-is/') ||
            id.includes('/use-sync-external-store/')
          ) return 'vendor-react';
          if (id.includes('/firebase/') || id.includes('/@firebase/') || id.includes('/firestore/') || id.includes('/idb/')) return 'vendor-firebase';
          if (id.includes('/framer-motion/')) return 'vendor-motion';
          if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory')) return 'vendor-charts';
          if (id.includes('/lucide-react/')) return 'vendor-icons';
          if (
            id.includes('/zod/') ||
            id.includes('/react-hook-form/') ||
            id.includes('/@hookform/')
          ) return 'vendor-forms';
          return 'vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: [
      // Admin tests run in their own Vite context with separate React instance
      'admin/**',
      'e2e/**',
      '**/node_modules/**',
    ],
  },
});
