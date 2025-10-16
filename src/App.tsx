import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
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
          
          {/* Dashboard Pages with Sidebar Layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/certificates" element={<Certificates />} />
            <Route path="/dashboard/certificates/:id" element={<CertificateDetail />} />
            <Route path="/dashboard/issue" element={<IssueCertificate />} />
            <Route path="/dashboard/batch-issue" element={<BatchIssue />} />
            <Route path="/dashboard/batch-upload-history" element={<BatchHistory />} />
            <Route path="/dashboard/recipients" element={<Recipients />} />
            <Route path="/dashboard/templates" element={<Templates />} />
            <Route path="/dashboard/institution" element={<Institution />} />
            <Route path="/dashboard/issuers" element={<Issuers />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/billing" element={<Billing />} />
            <Route path="/dashboard/webhooks/logs" element={<WebhookLogs />} />
            <Route path="/dashboard/my-certificates" element={<MyCertificates />} />
            <Route path="/dashboard/my-certificates/:id" element={<MyCertificateDetail />} />
          </Route>
          
          {/* Settings & Admin Pages with Sidebar Layout */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/settings/account" element={<AccountSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/settings/api-keys" element={<ApiKeys />} />
            <Route path="/settings/wallets" element={<Wallets />} />
            <Route path="/settings/webhooks" element={<WebhooksSettings />} />
            <Route path="/settings/integrations" element={<Integrations />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/institutions" element={<InstitutionManagement />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
          </Route>
          
          {/* Profile Pages (without sidebar) */}
          <Route path="/profile/:accountId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Additional Pages */}
          <Route path="/claim/:claimToken" element={<Claim />} />
          <Route path="/credentials" element={<ProtectedRoute><Credentials /></ProtectedRoute>} />
          <Route path="/identity/did-setup" element={<ProtectedRoute><DidSetup /></ProtectedRoute>} />
          <Route path="/ai-console" element={<ProtectedRoute><AiConsole /></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
