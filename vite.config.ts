import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ['portal.jet.net.il']
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Production optimizations
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('gsap')) {
              return 'animation-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack/react-query') || id.includes('axios')) {
              return 'query-vendor';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'map-vendor';
            }
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    sourcemap: false, // Disable sourcemaps for production
    // Reduce initial bundle size
    modulePreload: {
      polyfill: false, // Most modern browsers support module preload
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'axios'],
  }
}));
