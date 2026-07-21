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
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
            'vendor-charts': ['recharts'],
            'vendor-ui': ['lucide-react', 'framer-motion'],
          },
        },
      },
    },
  };
});
