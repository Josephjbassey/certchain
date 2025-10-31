import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // Explicit base path for Cloudflare Pages
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["@hashgraph/hedera-wallet-connect"],
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'production' ? false : true,
    minify: mode === 'production' ? 'esbuild' : false,
    commonjsOptions: {
      ignoreTryCatch: false,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'hedera-wallet': ['@hashgraph/hedera-wallet-connect'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  }
}));