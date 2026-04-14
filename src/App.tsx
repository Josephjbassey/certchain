import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth-context";
import { WalletProtectedRoute } from "@/components/WalletProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import Verify from "./pages/Verify";

// Dashboard
import Dashboard from "./pages/Dashboard";
import Issue from "./pages/Issue";
import MyCertificates from "./pages/MyCertificates";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="certchain-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/verify" element={<Verify />} />

                {/* Authenticated Routes */}
                <Route path="/dashboard" element={<WalletProtectedRoute><Dashboard /></WalletProtectedRoute>} />
                <Route path="/issue" element={<WalletProtectedRoute><Issue /></WalletProtectedRoute>} />
                <Route path="/certificates" element={<WalletProtectedRoute><MyCertificates /></WalletProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<div className="min-h-screen flex items-center justify-center p-6"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;