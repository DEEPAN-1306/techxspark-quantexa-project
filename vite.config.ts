import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/backend/**',
          '**/*.py',
          '**/*.pyc',
          '**/__pycache__/**',
          '**/*.db',
          '**/*.db-*',
          '**/*.sqlite*',
          '**/simulation_runtime_state.json',
          '**/*.log',
          '**/.system_generated/**',
          '**/dist/**',
          '**/*.json',
        ],
      },
    },
  };
});
