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
      // Prevent resolution of problematic @reown package paths
      "@reown/appkit/adapters": path.resolve(__dirname, "./src/lib/noop.ts"),
      "@reown/walletkit/adapters": path.resolve(__dirname, "./src/lib/noop.ts"),
    },
  },
  optimizeDeps: {
    exclude: ["@reown/appkit", "@reown/walletkit"],
  },
  build: {
    commonjsOptions: {
      ignoreTryCatch: false,
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
