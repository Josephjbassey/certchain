import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    commonjsOptions: {
      ignoreTryCatch: false,
    },
    rollupOptions: {
      external: [
        /^@reown\//,
      ],
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