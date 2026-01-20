import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      'figma:asset/1ccf434105a811706fd618a3b652ae052ecf47e1.png': path.resolve(__dirname, './src/assets/1ccf434105a811706fd618a3b652ae052ecf47e1.png'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // Performance optimizations
    minify: 'esbuild',
    sourcemap: false,
    // Code splitting configuration
    rollupOptions: {
      external: ['core-js/modules/es.promise.js'],
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Core React vendor chunk
          'vendor-react': ['react', 'react-dom'],
          // UI library chunk
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider',
            '@radix-ui/react-progress',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-separator',
            '@radix-ui/react-scroll-area',
          ],
          // Charts library (heavy)
          'vendor-charts': ['recharts'],
          // Animation library
          'vendor-animation': ['motion'],
          // Form handling
          'vendor-forms': ['react-hook-form'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Carousel
          'vendor-carousel': ['embla-carousel-react'],
          // Utilities
          'vendor-utils': ['clsx', 'tailwind-merge', 'class-variance-authority', 'cmdk'],
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/${chunkInfo.name}-[hash].js`;
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
      treeshake: true,
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
    // CSS code splitting
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    open: true,
    // Enable HMR
    hmr: {
      overlay: true,
    },
  },
  preview: {
    port: 4173,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'lucide-react',
    ],
    exclude: [
      '@testing-library/react',
      'next-themes',
      '@supabase/supabase-js',
    ],
  },
  // Enable JSON handling
  json: {
    stringify: true,
  },
  // CSS handling
  css: {
    devSourcemap: true,
  },
  // Environment variables prefix
  envPrefix: 'VITE_',
});