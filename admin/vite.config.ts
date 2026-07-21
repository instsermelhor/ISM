import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    server: {
      port: 3001,
      open: true,
    },
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(
        env.VITE_SITE_URL || 'http://localhost:3000'
      ),
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react') || id.includes('framer-motion')) {
                return 'vendor-ui';
              }
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
