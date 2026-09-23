import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: false,
    watch: {
      ignored: [
        '**/*tmpdir*/**',
        '**/*.tmp*',
        '**/backend/**',
        '**/artifacts/**',
        '**/cache/**',
        '**/contracts/**',
        '**/scripts/**',
        '**/test/**',
        '**/tests/**',
        '**/docs/**',
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-web3': ['ethers'],
          'vendor-ui': ['lucide-react', 'qrcode.react', 'canvas-confetti'],
        },
      },
    },
  },
});
