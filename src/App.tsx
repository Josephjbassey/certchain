import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Verify from "./pages/Verify";
import VerifyDetail from "./pages/VerifyDetail";
import VerifyScan from "./pages/VerifyScan";
import VerifyStatus from "./pages/VerifyStatus";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Docs from "./pages/Docs";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";
import TwoFactor from "./pages/auth/TwoFactor";
import Dashboard from "./pages/Dashboard";
import Certificates from "./pages/dashboard/Certificates";
import CertificateDetail from "./pages/dashboard/CertificateDetail";
import IssueCertificate from "./pages/dashboard/IssueCertificate";
import BatchIssue from "./pages/dashboard/BatchIssue";
import BatchHistory from "./pages/dashboard/BatchHistory";
import Recipients from "./pages/dashboard/Recipients";
import Templates from "./pages/dashboard/Templates";
import Institution from "./pages/dashboard/Institution";
import Issuers from "./pages/dashboard/Issuers";
import Analytics from "./pages/dashboard/Analytics";
import Billing from "./pages/dashboard/Billing";
import WebhookLogs from "./pages/dashboard/WebhookLogs";
import MyCertificates from "./pages/dashboard/MyCertificates";
import MyCertificateDetail from "./pages/dashboard/MyCertificateDetail";
import Profile from "./pages/Profile";
import AccountSettings from "./pages/settings/AccountSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import PrivacySettings from "./pages/settings/PrivacySettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import ApiKeys from "./pages/settings/ApiKeys";
import Wallets from "./pages/settings/Wallets";
import WebhooksSettings from "./pages/settings/WebhooksSettings";
import Integrations from "./pages/settings/Integrations";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import InstitutionManagement from "./pages/admin/InstitutionManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import NotFound from "./pages/NotFound";
import Claim from "./pages/Claim";
import Credentials from "./pages/Credentials";
import DidSetup from "./pages/DidSetup";
import AiConsole from "./pages/AiConsole";
import { DashboardLayout } from "./components/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<Index />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/verify/:certificateId" element={<VerifyDetail />} />
                <Route path="/verify/scan" element={<VerifyScan />} />
                <Route path="/verify/status/:verificationId" element={<VerifyStatus />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/contact" element={<Contact />} />

                {/* Auth Pages */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
                <Route path="/auth/verify-email" element={<VerifyEmail />} />
                <Route path="/auth/2fa" element={<TwoFactor />} />

                {/* == Authenticated Routes == */}

                {/* Legacy /dashboard redirect - will redirect to role-specific dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                {/* Candidate Dashboard Routes */}
                <Route element={<ProtectedRoute requiredRole="candidate"><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/candidate/dashboard" element={<Dashboard />} />
                  <Route path="/candidate/my-certificates" element={<MyCertificates />} />
                  <Route path="/candidate/my-certificates/:id" element={<MyCertificateDetail />} />
                  <Route path="/candidate/settings/account" element={<AccountSettings />} />
                  <Route path="/candidate/settings/notifications" element={<NotificationSettings />} />
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
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
