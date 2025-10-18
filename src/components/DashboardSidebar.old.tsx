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
  { title: "My Certificates", url: "/dashboard/my-certificates", icon: FolderClosed, roles: ["candidate", "user"] },
  { title: "All Certificates", url: "/dashboard/certificates", icon: Award, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Issue Certificate", url: "/dashboard/issue", icon: FileText, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Batch Issue", url: "/dashboard/batch-issue", icon: Upload, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Batch History", url: "/dashboard/batch-upload-history", icon: Clock, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Recipients", url: "/dashboard/recipients", icon: Users, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Templates", url: "/dashboard/templates", icon: FileStack, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Institution", url: "/dashboard/institution", icon: Building2, roles: ["institution_admin", "admin"] },
  { title: "Issuers", url: "/dashboard/issuers", icon: UserCheck, roles: ["institution_admin", "admin"] },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard, roles: ["institution_admin", "admin"] },
  { title: "Webhook Logs", url: "/dashboard/webhooks/logs", icon: Webhook, roles: ["institution_admin", "admin"] },
];

const settingsItems = [
  { title: "Account", url: "/settings/account", icon: User },
  { title: "Notifications", url: "/settings/notifications", icon: Bell },
  { title: "Privacy", url: "/settings/privacy", icon: Shield },
  { title: "Security", url: "/settings/security", icon: Lock },
  { title: "API Keys", url: "/settings/api-keys", icon: Key, roles: ["instructor", "institution_admin", "issuer", "admin"] },
  { title: "Wallets", url: "/settings/wallets", icon: Wallet },
  { title: "Webhooks", url: "/settings/webhooks", icon: Webhook, roles: ["institution_admin", "admin"] },
  { title: "Integrations", url: "/settings/integrations", icon: GitBranch, roles: ["institution_admin", "admin"] },
];

const superAdminItems = [
  { title: "Platform Dashboard", url: "/admin", icon: LayoutDashboard, roles: ["super_admin"] },
  { title: "All Institutions", url: "/admin/institutions", icon: Building2, roles: ["super_admin"] },
  { title: "Platform Analytics", url: "/admin/analytics", icon: BarChart3, roles: ["super_admin"] },
  { title: "System Settings", url: "/admin/settings", icon: Settings, roles: ["super_admin"] },
  { title: "Audit Logs", url: "/admin/logs", icon: Logs, roles: ["super_admin"] },
];

const institutionAdminItems = [
  { title: "Institution Dashboard", url: "/institution", icon: LayoutDashboard, roles: ["institution_admin"] },
  { title: "Instructors", url: "/institution/instructors", icon: UserCheck, roles: ["institution_admin"] },
  { title: "All Candidates", url: "/institution/candidates", icon: Users, roles: ["institution_admin"] },
  { title: "Institution Settings", url: "/institution/settings", icon: Settings, roles: ["institution_admin"] },
  { title: "Analytics", url: "/institution/analytics", icon: BarChart3, roles: ["institution_admin"] },
];

const instructorItems = [
  { title: "Instructor Dashboard", url: "/instructor", icon: LayoutDashboard, roles: ["instructor"] },
  { title: "My Candidates", url: "/instructor/candidates", icon: Users, roles: ["instructor"] },
  { title: "Issue Certificates", url: "/instructor/issue", icon: FileText, roles: ["instructor"] },
  { title: "Batch Issue", url: "/instructor/batch-issue", icon: Upload, roles: ["instructor"] },
  { title: "Analytics", url: "/instructor/analytics", icon: BarChart3, roles: ["instructor"] },
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

  const hasRole = (requiredRole: string) => {
    if (!userRole) return false;
    const roleStr = userRole as string;
    
    // Super admin has access to everything
    if (roleStr === 'super_admin') return true;
    
    // Check exact match
    if (roleStr === requiredRole) return true;
    
    // Institution admin has access to instructor and candidate features
    if (roleStr === 'institution_admin' && ['instructor', 'candidate', 'user', 'issuer'].includes(requiredRole)) return true;
    
    // Instructor has access to candidate features
    if (roleStr === 'instructor' && ['candidate', 'user'].includes(requiredRole)) return true;
    
    // Backward compatibility
    if (roleStr === 'admin' && ['issuer', 'user', 'candidate'].includes(requiredRole)) return true;
    if (roleStr === 'issuer' && ['user', 'candidate'].includes(requiredRole)) return true;
    
    return false;
  };

  const filterByRole = (items: typeof dashboardItems) => {
    return items.filter(item => {
      if (!item.roles) return true;
      return item.roles.some(role => hasRole(role));
    });
  };

  const filteredDashboard = filterByRole(dashboardItems);
  const filteredSettings = filterByRole(settingsItems);
  const filteredSuperAdmin = filterByRole(superAdminItems);
  const filteredInstitutionAdmin = filterByRole(institutionAdminItems);
  const filteredInstructor = filterByRole(instructorItems);

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-16 bg-sidebar" : "w-64 bg-sidebar"}>
      <SidebarContent className="bg-sidebar">
        {/* Super Admin Section */}
        {filteredSuperAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">Platform Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSuperAdmin.map((item) => (
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

        {/* Institution Admin Section */}
        {filteredInstitutionAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">Institution</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredInstitutionAdmin.map((item) => (
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

        {/* Instructor Section */}
        {filteredInstructor.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">Instructor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredInstructor.map((item) => (
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

        {/* Dashboard Section */}
        {filteredDashboard.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70">Dashboard</SidebarGroupLabel>
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
        )}

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Settings</SidebarGroupLabel>
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
      </SidebarContent>
    </Sidebar>
  );
}
