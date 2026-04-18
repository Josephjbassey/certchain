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
import VerifyDetail from "./pages/VerifyDetail";
import VerifyScan from "./pages/VerifyScan";
import VerifyStatus from "./pages/VerifyStatus";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Docs from "./pages/Docs";
import Pricing from "./pages/Pricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import TwoFactor from "./pages/auth/TwoFactor";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Dashboard / Authenticated
import Dashboard from "./pages/Dashboard";
import Issue from "./pages/Issue";
import Credentials from "./pages/Credentials";
import MyCertificates from "./pages/MyCertificates";
import MyCertificateDetail from "./pages/MyCertificateDetail";
import AiConsole from "./pages/AiConsole";

const queryClient = new QueryClient();

// Basic ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
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
                <Route path="/verify/scan" element={<VerifyScan />} />
                <Route path="/verify/:certificateId" element={<VerifyDetail />} />
                <Route path="/verify/status/:verificationId" element={<VerifyStatus />} />

                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/profile/:accountId" element={<Profile />} />

                {/* Auth Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/auth/2fa" element={<TwoFactor />} />
                <Route path="/auth/verify-email" element={<VerifyEmail />} />

                {/* Authenticated Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/issue" element={<ProtectedRoute><Issue /></ProtectedRoute>} />
                <Route path="/credentials" element={<ProtectedRoute><Credentials /></ProtectedRoute>} />
                <Route path="/my-certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
                <Route path="/my-certificates/:id" element={<ProtectedRoute><MyCertificateDetail /></ProtectedRoute>} />
                <Route path="/certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
                <Route path="/certificates/:id" element={<ProtectedRoute><MyCertificateDetail /></ProtectedRoute>} />
                <Route path="/ai-console" element={<ProtectedRoute><AiConsole /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
