import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function DashboardLayout() {
  const { signOut, user } = useAuth();

  // Fetch user profile for display
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <DashboardSidebar />

        <SidebarInset className="flex-1">
          {/* Enhanced Header with Glassmorphism */}
          <header className="border-b border-border/40 backdrop-blur-xl sticky top-0 z-50 bg-background/60 shadow-sm">
            <div className="flex items-center justify-between px-6 py-3.5">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-primary/10 transition-colors" />
                <Link
                  to="/"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                >
                  <img
                    src="/images/logo.png"
                    alt="CertChain"
                    className="h-9 group-hover:scale-105 transition-transform duration-200"
                  />
                </Link>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2">
                {/* Settings Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hover:bg-primary/10 transition-all duration-200"
                >
                  <Link to="/settings/account" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                </Button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-200"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 p-2 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2 p-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-lg font-semibold">
                              {getInitials(profile?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-semibold leading-none">
                              {profile?.full_name || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground leading-none">
                              {profile?.email || user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-primary/10 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>View Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link
                        to="/settings/account"
                        className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-primary/10 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Account Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="cursor-pointer flex items-center gap-2 px-2 py-2 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content with Padding and Animation */}
          <main className="flex-1 animate-in fade-in duration-500">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
