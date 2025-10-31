import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Error boundary for catching render errors
const rootElement = document.getElementById("root");

if (!rootElement) {
    throw new Error("Root element not found. Please check your HTML file.");
}

try {
    createRoot(rootElement).render(<App />);
} catch (error) {
    console.error("Failed to render app:", error);
    // Display error message to user
    rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; font-family: system-ui;">
      <div style="max-width: 600px; text-align: center;">
        <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #dc2626;">Application Error</h1>
        <p style="margin-bottom: 1rem; color: #6b7280;">Failed to load the application. Please try refreshing the page.</p>
        <details style="text-align: left; background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
          <summary style="cursor: pointer; font-weight: 600;">Error Details</summary>
          <pre style="margin-top: 0.5rem; font-size: 0.875rem; overflow-x: auto;">${error}</pre>
        </details>
      </div>
    </div>
  `;
}

