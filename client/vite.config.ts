import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En Docker: API_TARGET=http://backend:8080 (inyectado por docker-compose)
// En local:  no definida → apunta al servidor de desarrollo en puerto 5000
const API_TARGET = process.env.API_TARGET ?? 'http://localhost:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
  },
});
