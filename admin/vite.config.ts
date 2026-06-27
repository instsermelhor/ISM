import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    server: {
      port: 3001,
      open: true,
    },
    define: {
      // Expõe VITE_SITE_URL para acesso no código via import.meta.env
      // Em dev: http://localhost:3000  |  Em produção: URL do Firebase Hosting
      'import.meta.env.VITE_SITE_URL': JSON.stringify(
        env.VITE_SITE_URL || 'http://localhost:3000'
      ),
    },
  };
});
