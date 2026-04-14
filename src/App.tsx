import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/lib/auth-context";

// Public Pages
import Index from "./pages/Index";
import Verify from "./pages/Verify";

// Dashboard
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

// Basic ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center p-6">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

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
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                {/* Dummy routes so Dashboard Links don't 404 */}
                <Route path="/issue" element={<Navigate to="/dashboard" replace />} />
                <Route path="/certificates" element={<Navigate to="/dashboard" replace />} />

                {/* Dummy Login route for auth guard redirection */}
                <Route path="/auth/login" element={<div className="min-h-screen flex items-center justify-center p-6"><h1 className="text-2xl font-bold">Login required (Placeholder)</h1></div>} />

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
