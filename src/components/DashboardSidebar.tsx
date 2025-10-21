import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Award,
  FileText,
  Upload,
  Clock,
  Users,
  FileStack,
  Building2,
  UserCheck,
  BarChart3,
  CreditCard,
  Webhook,
  Shield,
  FolderClosed,
  Settings,
  User,
  Bell,
  Lock,
  Key,
  Wallet,
  GitBranch,
  FileCode,
  Logs,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserRole } from "@/hooks/useUserRole";
import type { UserRole } from "@/hooks/useUserRole";

// Helper to get role prefix for paths
const getRolePrefix = (role: UserRole | null | undefined): string => {
  if (!role) return 'candidate';
  
  switch (role) {
    case 'super_admin':
      return 'admin';
    case 'institution_admin':
      return 'institution';
    case 'instructor':
      return 'instructor';
    case 'candidate':
    default:
      return 'candidate';
  }
};

// Helper to check if user has access to a feature
const hasAccessToFeature = (userRole: UserRole | null | undefined, allowedRoles?: string[]): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userRole) return false;
  
  const roleStr = userRole as string;
  
  // Super admin has access to everything
  if (roleStr === 'super_admin' || roleStr === 'admin') return true;
  
  // Check if user's role is in allowed roles
  if (allowedRoles.includes(roleStr)) return true;
  
  // Legacy role compatibility
  if (roleStr === 'issuer' && allowedRoles.includes('instructor')) return true;
  if (roleStr === 'user' && allowedRoles.includes('candidate')) return true;
  
  return false;
};

const candidateDashboardItems = [
  { title: "Dashboard", path: "dashboard", icon: LayoutDashboard },
  { title: "My Certificates", path: "my-certificates", icon: FolderClosed },
];

const instructorDashboardItems = [
  { title: "Dashboard", path: "dashboard", icon: LayoutDashboard },
  { title: "All Certificates", path: "certificates", icon: Award },
  { title: "Issue Certificate", path: "issue", icon: FileText },
  { title: "Batch Issue", path: "batch-issue", icon: Upload },
  { title: "Batch History", path: "batch-upload-history", icon: Clock },
  { title: "Candidates", path: "recipients", icon: Users },
  { title: "Templates", path: "templates", icon: FileStack },
  { title: "Analytics", path: "analytics", icon: BarChart3 },
];

const institutionDashboardItems = [
  { title: "Dashboard", path: "dashboard", icon: LayoutDashboard },
  { title: "All Certificates", path: "certificates", icon: Award },
  { title: "Issue Certificate", path: "issue", icon: FileText },
  { title: "Batch Issue", path: "batch-issue", icon: Upload },
  { title: "Batch History", path: "batch-upload-history", icon: Clock },
  { title: "Institution", path: "institution", icon: Building2 },
  { title: "Staff & Instructors", path: "issuers", icon: UserCheck },
  { title: "Templates", path: "templates", icon: FileStack },
  { title: "Analytics", path: "analytics", icon: BarChart3 },
  { title: "Billing", path: "billing", icon: CreditCard },
  { title: "Webhook Logs", path: "webhooks/logs", icon: Webhook },
];

const adminDashboardItems = [
  { title: "Dashboard", path: "dashboard", icon: LayoutDashboard },
];

const settingsItems = [
  { title: "Account", path: "settings/account", icon: User, shared: true },
  { title: "Notifications", path: "settings/notifications", icon: Bell, shared: true },
  { title: "Privacy", path: "settings/privacy", icon: Shield, shared: true },
  { title: "Security", path: "settings/security", icon: Lock, shared: true },
  { title: "API Keys", path: "settings/api-keys", icon: Key, roles: ["instructor", "institution_admin"] },
  { title: "Wallets", path: "settings/wallets", icon: Wallet, shared: true },
  { title: "Webhooks", path: "settings/webhooks", icon: Webhook, roles: ["institution_admin"] },
  { title: "Integrations", path: "settings/integrations", icon: GitBranch, roles: ["institution_admin"] },
];

const adminItems = [
  { title: "Users", path: "users", icon: Users, roles: ["super_admin"] },
  { title: "Onboard Institutions", path: "institutions", icon: Building2, roles: ["super_admin"] },
  { title: "Analytics", path: "analytics", icon: BarChart3, roles: ["super_admin"] },
  { title: "System Settings", path: "settings", icon: Settings, roles: ["super_admin"] },
  { title: "Audit Logs", path: "logs", icon: Logs, roles: ["super_admin"] },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: userRole } = useUserRole();
  const collapsed = state === "collapsed";

  const rolePrefix = getRolePrefix(userRole);

  const isActive = (fullPath: string) => {
    return currentPath.startsWith(fullPath);
  };

  const getNavClass = (fullPath: string) => {
    return isActive(fullPath) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "";
  };

  const buildPath = (item: any) => {
    // Shared settings use /settings path for all roles
    if (item.shared) {
      return `/${item.path}`;
    }
    // Otherwise prefix with role
    return `/${rolePrefix}/${item.path}`;
  };

  const menuItems = (() => {
  switch (rolePrefix) {
    case 'admin':
      return adminDashboardItems;
    case 'institution':
      return institutionDashboardItems;
    case 'instructor':
      return instructorDashboardItems;
    case 'candidate':
    default:
      return candidateDashboardItems;
  }
})();
  const filteredSettings = settingsItems.filter(item => hasAccessToFeature(userRole, item.roles));
  const filteredAdmin = adminItems.filter(item => hasAccessToFeature(userRole, item.roles));

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent>
        {/* Dashboard Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const fullPath = buildPath(item);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={fullPath} className={getNavClass(fullPath)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSettings.map((item) => {
                const fullPath = buildPath(item);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={fullPath} className={getNavClass(fullPath)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {filteredAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdmin.map((item) => {
                  const fullPath = buildPath(item);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink to={fullPath} className={getNavClass(fullPath)}>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
