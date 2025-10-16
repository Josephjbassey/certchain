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

const dashboardItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Certificates", url: "/dashboard/my-certificates", icon: FolderClosed },
  { title: "All Certificates", url: "/dashboard/certificates", icon: Award, roles: ["issuer", "admin"] },
  { title: "Issue Certificate", url: "/dashboard/issue", icon: FileText, roles: ["issuer", "admin"] },
  { title: "Batch Issue", url: "/dashboard/batch-issue", icon: Upload, roles: ["issuer", "admin"] },
  { title: "Batch History", url: "/dashboard/batch-upload-history", icon: Clock, roles: ["issuer", "admin"] },
  { title: "Recipients", url: "/dashboard/recipients", icon: Users, roles: ["issuer", "admin"] },
  { title: "Templates", url: "/dashboard/templates", icon: FileStack, roles: ["issuer", "admin"] },
  { title: "Institution", url: "/dashboard/institution", icon: Building2, roles: ["admin"] },
  { title: "Issuers", url: "/dashboard/issuers", icon: UserCheck, roles: ["admin"] },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: ["issuer", "admin"] },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard, roles: ["admin"] },
  { title: "Webhook Logs", url: "/dashboard/webhooks/logs", icon: Webhook, roles: ["admin"] },
];

const settingsItems = [
  { title: "Account", url: "/settings/account", icon: User },
  { title: "Notifications", url: "/settings/notifications", icon: Bell },
  { title: "Privacy", url: "/settings/privacy", icon: Shield },
  { title: "Security", url: "/settings/security", icon: Lock },
  { title: "API Keys", url: "/settings/api-keys", icon: Key, roles: ["issuer", "admin"] },
  { title: "Wallets", url: "/settings/wallets", icon: Wallet },
  { title: "Webhooks", url: "/settings/webhooks", icon: Webhook, roles: ["admin"] },
  { title: "Integrations", url: "/settings/integrations", icon: GitBranch, roles: ["admin"] },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["admin"] },
  { title: "User Management", url: "/admin/users", icon: Users, roles: ["admin"] },
  { title: "Institutions", url: "/admin/institutions", icon: Building2, roles: ["admin"] },
  { title: "System Settings", url: "/admin/settings", icon: Settings, roles: ["admin"] },
  { title: "Audit Logs", url: "/admin/logs", icon: Logs, roles: ["admin"] },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { data: userRole } = useUserRole();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    return isActive(path) 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "";
  };

  const hasRole = (requiredRole: "user" | "issuer" | "admin") => {
    if (!userRole) return false;
    if (requiredRole === "user") return true;
    if (requiredRole === "issuer") return userRole === "issuer" || userRole === "admin";
    if (requiredRole === "admin") return userRole === "admin";
    return false;
  };

  const filterByRole = (items: typeof dashboardItems) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => hasRole(role as "user" | "issuer" | "admin"));
    });
  };

  const filteredDashboard = filterByRole(dashboardItems);
  const filteredSettings = filterByRole(settingsItems);
  const filteredAdmin = filterByRole(adminItems);

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-16" : "w-64"}>
      <SidebarContent>
        {/* Dashboard Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredDashboard.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSettings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {filteredAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
