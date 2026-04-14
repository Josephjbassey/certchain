import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Public Pages
import Index from "./pages/Index";
import Verify from "./pages/Verify";

// Dashboard
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="certchain-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/verify" element={<Verify />} />

              {/* Authenticated Routes */}
              {/* Using a regular Route for now to quickly map /dashboard to Dashboard.tsx. In a full rebuild, we might wrap this in a ProtectedRoute/WalletProtectedRoute component. */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Catch-all */}
              <Route path="*" element={<div className="min-h-screen flex items-center justify-center p-6"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
