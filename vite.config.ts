import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd'],
          icons: ['react-icons', 'lucide-react']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      'react-icons': 'react-icons'
    }
  },
  optimizeDeps: {
    include: ['react-icons']
  },
  server: {
    port: 3000
  }
});
