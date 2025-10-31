import { Toaster } from "@/components/ui/toaster";import { Toaster } from "@/components/ui/toaster";

import { Toaster as Sonner } from "@/components/ui/sonner";import { Toaster as Sonner } from "@/components/ui/sonner";

import { TooltipProvider } from "@/components/ui/tooltip";import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BrowserRouter, Routes, Route } from "react-router-dom";import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/lib/theme-provider";import { ThemeProvider } from "@/lib/theme-provider";

import { HederaWalletProvider } from "@/contexts/HederaWalletContext";import { AuthProvider } from "@/lib/auth-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";import { HederaWalletProvider } from "@/contexts/HederaWalletContext";

import { WalletProtectedRoute } from "@/components/WalletProtectedRoute";import { ErrorBoundary } from "@/components/ErrorBoundary";

import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public Pagesimport Index from "./pages/Index";

import Index from "./pages/Index";import Verify from "./pages/Verify";

import Verify from "./pages/Verify";import VerifyDetail from "./pages/VerifyDetail";

import VerifyDetail from "./pages/VerifyDetail";import VerifyScan from "./pages/VerifyScan";

import VerifyScan from "./pages/VerifyScan";import VerifyStatus from "./pages/VerifyStatus";

import VerifyStatus from "./pages/VerifyStatus";import Pricing from "./pages/Pricing";

import Pricing from "./pages/Pricing";import About from "./pages/About";

import About from "./pages/About";import Docs from "./pages/Docs";

import Docs from "./pages/Docs";import Contact from "./pages/Contact";

import Contact from "./pages/Contact";import Login from "./pages/auth/Login";

import TermsOfService from "./pages/TermsOfService";import Signup from "./pages/auth/Signup";

import PrivacyPolicy from "./pages/PrivacyPolicy";import ForgotPassword from "./pages/auth/ForgotPassword";

import NotFound from "./pages/NotFound";import ResetPassword from "./pages/auth/ResetPassword";

import VerifyEmail from "./pages/auth/VerifyEmail";

// Wallet-Protected Pagesimport TwoFactor from "./pages/auth/TwoFactor";

import Issue from "./pages/Issue";import Dashboard from "./pages/Dashboard";

import MyCertificates from "./pages/MyCertificates";import Certificates from "./pages/dashboard/Certificates";

import MyCertificateDetail from "./pages/MyCertificateDetail";import CertificateDetail from "./pages/dashboard/CertificateDetail";

import Profile from "./pages/Profile";import IssueCertificate from "./pages/dashboard/IssueCertificate";

import Credentials from "./pages/Credentials";import BatchIssue from "./pages/dashboard/BatchIssue";

import BatchHistory from "./pages/dashboard/BatchHistory";

const queryClient = new QueryClient();import Recipients from "./pages/dashboard/Recipients";

import Templates from "./pages/dashboard/Templates";

const App = () => (import Institution from "./pages/dashboard/Institution";

  <ErrorBoundary>import Issuers from "./pages/dashboard/Issuers";

    <QueryClientProvider client={queryClient}>import Analytics from "./pages/dashboard/Analytics";

      <ThemeProvider defaultTheme="system" storageKey="certchain-theme">import Billing from "./pages/dashboard/Billing";

        <HederaWalletProvider>import WebhookLogs from "./pages/dashboard/WebhookLogs";

          <TooltipProvider>import MyCertificates from "./pages/dashboard/MyCertificates";

            <Toaster />import MyCertificateDetail from "./pages/dashboard/MyCertificateDetail";

            <Sonner />import CandidateDashboard from "./pages/dashboard/CandidateDashboard";

            <BrowserRouter>import Profile from "./pages/Profile";

              <Routes>import AccountSettings from "./pages/settings/AccountSettings";

                {/* ===== Public Routes (No Wallet Required) ===== */}import NotificationSettings from "./pages/settings/NotificationSettings";

                <Route path="/" element={<Index />} />import PrivacySettings from "./pages/settings/PrivacySettings";

                <Route path="/verify" element={<Verify />} />import SecuritySettings from "./pages/settings/SecuritySettings";

                <Route path="/verify/:certificateId" element={<VerifyDetail />} />import ApiKeys from "./pages/settings/ApiKeys";

                <Route path="/verify/scan" element={<VerifyScan />} />import Wallets from "./pages/settings/Wallets";

                <Route path="/verify/status/:verificationId" element={<VerifyStatus />} />import WebhooksSettings from "./pages/settings/WebhooksSettings";

                <Route path="/about" element={<About />} />import Integrations from "./pages/settings/Integrations";

                <Route path="/pricing" element={<Pricing />} />import AdminLogs from "./pages/admin/AdminLogs";

                <Route path="/docs" element={<Docs />} />import AdminDashboard from "./pages/admin/AdminDashboard";

                <Route path="/contact" element={<Contact />} />import UserManagement from "./pages/admin/UserManagement";

                <Route path="/terms-of-service" element={<TermsOfService />} />import InstitutionManagement from "./pages/admin/InstitutionManagement";

                <Route path="/privacy-policy" element={<PrivacyPolicy />} />import SystemSettings from "./pages/admin/SystemSettings";

import NotFound from "./pages/NotFound";

                {/* ===== Wallet-Protected Routes ===== */}import Claim from "./pages/Claim";

                <Routeimport Credentials from "./pages/Credentials";

                  path="/issue"import DidSetup from "./pages/DidSetup";

                  element={import AiConsole from "./pages/AiConsole";

                    <WalletProtectedRoute>import TermsOfService from "./pages/TermsOfService";

                      <Issue />import PrivacyPolicy from "./pages/PrivacyPolicy";

                    </WalletProtectedRoute>import { DashboardLayout } from "./components/DashboardLayout";

                  }

                />const queryClient = new QueryClient();

                <Route

                  path="/my-certificates"const App = () => (

                  element={  <ErrorBoundary>

                    <WalletProtectedRoute>    <QueryClientProvider client={queryClient}>

                      <MyCertificates />      <ThemeProvider defaultTheme="system" storageKey="certchain-theme">

                    </WalletProtectedRoute>        <HederaWalletProvider>

                  }          <TooltipProvider>

                />            <Toaster />

                <Route            <Sonner />

                  path="/my-certificates/:id"            <BrowserRouter>

                  element={              <AuthProvider>

                    <WalletProtectedRoute>                <Routes>

                      <MyCertificateDetail />                  {/* Public Pages */}

                    </WalletProtectedRoute>                  <Route path="/" element={<Index />} />

                  }                  <Route path="/verify" element={<Verify />} />

                />                  <Route path="/verify/:certificateId" element={<VerifyDetail />} />

                <Route                  <Route path="/verify/scan" element={<VerifyScan />} />

                  path="/profile/:accountId"                  <Route path="/verify/status/:verificationId" element={<VerifyStatus />} />

                  element={                  <Route path="/pricing" element={<Pricing />} />

                    <WalletProtectedRoute>                  <Route path="/about" element={<About />} />

                      <Profile />                  <Route path="/docs" element={<Docs />} />

                    </WalletProtectedRoute>                  <Route path="/contact" element={<Contact />} />

                  }                  <Route path="/terms-of-service" element={<TermsOfService />} />

                />                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                <Route

                  path="/credentials"                  {/* Auth Pages */}

                  element={                  <Route path="/auth/login" element={<Login />} />

                    <WalletProtectedRoute>                  <Route path="/auth/signup" element={<Signup />} />

                      <Credentials />                  <Route path="/auth/forgot-password" element={<ForgotPassword />} />

                    </WalletProtectedRoute>                  <Route path="/auth/reset-password/:token" element={<ResetPassword />} />

                  }                  <Route path="/auth/verify-email" element={<VerifyEmail />} />

                />                  <Route path="/auth/2fa" element={<TwoFactor />} />



                {/* ===== 404 Not Found ===== */}                  {/* == Authenticated Routes == */}

                <Route path="*" element={<NotFound />} />

              </Routes>                  {/* Legacy /dashboard redirect - will redirect to role-specific dashboard */}

            </BrowserRouter>                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          </TooltipProvider>

        </HederaWalletProvider>                  {/* Candidate Dashboard Routes */}

      </ThemeProvider>                  <Route element={<ProtectedRoute requiredRole="candidate"><DashboardLayout /></ProtectedRoute>}>

    </QueryClientProvider>                    <Route path="/candidate/dashboard" element={<CandidateDashboard />} />

  </ErrorBoundary>                    <Route path="/candidate/my-certificates" element={<MyCertificates />} />

);                    <Route path="/candidate/my-certificates/:id" element={<MyCertificateDetail />} />

                    <Route path="/candidate/settings/account" element={<AccountSettings />} />

export default App;                    <Route path="/candidate/settings/notifications" element={<NotificationSettings />} />

                    <Route path="/candidate/settings/privacy" element={<PrivacySettings />} />
                    <Route path="/candidate/settings/security" element={<SecuritySettings />} />
                    <Route path="/candidate/settings/wallets" element={<Wallets />} />
                  </Route>

                  {/* Instructor Dashboard Routes */}
                  <Route element={<ProtectedRoute requiredRole="instructor"><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/instructor/dashboard" element={<Dashboard />} />
                    <Route path="/instructor/certificates" element={<Certificates />} />
                    <Route path="/instructor/certificates/:id" element={<CertificateDetail />} />
                    <Route path="/instructor/issue" element={<IssueCertificate />} />
                    <Route path="/instructor/batch-issue" element={<BatchIssue />} />
                    <Route path="/instructor/batch-upload-history" element={<BatchHistory />} />
                    <Route path="/instructor/recipients" element={<Recipients />} />
                    <Route path="/instructor/templates" element={<Templates />} />
                    <Route path="/instructor/analytics" element={<Analytics />} />
                    <Route path="/instructor/my-certificates" element={<MyCertificates />} />
                    <Route path="/instructor/my-certificates/:id" element={<MyCertificateDetail />} />
                    <Route path="/instructor/settings/account" element={<AccountSettings />} />
                    <Route path="/instructor/settings/notifications" element={<NotificationSettings />} />
                    <Route path="/instructor/settings/privacy" element={<PrivacySettings />} />
                    <Route path="/instructor/settings/security" element={<SecuritySettings />} />
                    <Route path="/instructor/settings/wallets" element={<Wallets />} />
                    <Route path="/instructor/settings/api-keys" element={<ApiKeys />} />
                  </Route>

                  {/* Institution Admin Dashboard Routes */}
                  <Route element={<ProtectedRoute requiredRole="institution_admin"><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/institution/dashboard" element={<Dashboard />} />
                    <Route path="/institution/certificates" element={<Certificates />} />
                    <Route path="/institution/certificates/:id" element={<CertificateDetail />} />
                    <Route path="/institution/issue" element={<IssueCertificate />} />
                    <Route path="/institution/batch-issue" element={<BatchIssue />} />
                    <Route path="/institution/batch-upload-history" element={<BatchHistory />} />
                    <Route path="/institution/recipients" element={<Recipients />} />
                    <Route path="/institution/templates" element={<Templates />} />
                    <Route path="/institution/analytics" element={<Analytics />} />
                    <Route path="/institution/institution" element={<Institution />} />
                    <Route path="/institution/issuers" element={<Issuers />} />
                    <Route path="/institution/billing" element={<Billing />} />
                    <Route path="/institution/webhooks/logs" element={<WebhookLogs />} />
                    <Route path="/institution/my-certificates" element={<MyCertificates />} />
                    <Route path="/institution/my-certificates/:id" element={<MyCertificateDetail />} />
                    <Route path="/institution/settings/account" element={<AccountSettings />} />
                    <Route path="/institution/settings/notifications" element={<NotificationSettings />} />
                    <Route path="/institution/settings/privacy" element={<PrivacySettings />} />
                    <Route path="/institution/settings/security" element={<SecuritySettings />} />
                    <Route path="/institution/settings/wallets" element={<Wallets />} />
                    <Route path="/institution/settings/api-keys" element={<ApiKeys />} />
                    <Route path="/institution/settings/webhooks" element={<WebhooksSettings />} />
                    <Route path="/institution/settings/integrations" element={<Integrations />} />
                  </Route>

                  {/* Super Admin Dashboard Routes */}
                  <Route element={<ProtectedRoute requiredRole="super_admin"><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/institutions" element={<InstitutionManagement />} />
                    <Route path="/admin/settings" element={<SystemSettings />} />
                    <Route path="/admin/settings/integrations" element={<Integrations />} />
                    <Route path="/admin/settings/webhooks" element={<WebhooksSettings />} />
                    <Route path="/admin/settings/api-keys" element={<ApiKeys />} />
                    <Route path="/admin/logs" element={<AdminLogs />} />
                    <Route path="/admin/certificates" element={<Certificates />} />
                    <Route path="/admin/certificates/:id" element={<CertificateDetail />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
                    <Route path="/admin/billing" element={<Billing />} />
                  </Route>

                  {/* Shared Settings Routes (all authenticated users) */}
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/settings/account" element={<AccountSettings />} />
                    <Route path="/settings/notifications" element={<NotificationSettings />} />
                    <Route path="/settings/privacy" element={<PrivacySettings />} />
                    <Route path="/settings/security" element={<SecuritySettings />} />
                    <Route path="/settings/wallets" element={<Wallets />} />
                  </Route>

                  {/* Profile & Utility Pages (without sidebar) */}
                  <Route path="/profile/:accountId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/claim/:claimToken" element={<Claim />} />
                  <Route path="/credentials" element={<ProtectedRoute><Credentials /></ProtectedRoute>} />
                  <Route path="/identity/did-setup" element={<ProtectedRoute><DidSetup /></ProtectedRoute>} />
                  <Route path="/ai-console" element={<ProtectedRoute requiredRole="instructor"><AiConsole /></ProtectedRoute>} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </HederaWalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
