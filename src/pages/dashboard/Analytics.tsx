import { TrendingUp, Award, Users, Activity, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const Analytics = () => {
  const { user } = useAuth();

  // Get user's institution
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user?.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  // Get certificate stats
  const { data: stats } = useQuery({
    queryKey: ['certificate-stats', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return null;
      
      const { data: certificates } = await supabase
        .from('certificate_cache')
        .select('issued_at, revoked_at, created_at')
        .eq('institution_id', profile.institution_id);
      
      const now = new Date();
      const thisMonth = certificates?.filter(cert => {
        const date = new Date(cert.issued_at);
        return date.getMonth() === now.getMonth() &&
               date.getFullYear() === now.getFullYear();
      }).length || 0;
      
      const lastMonth = certificates?.filter(cert => {
        const date = new Date(cert.issued_at);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
        return date.getMonth() === lastMonthDate.getMonth() &&
               date.getFullYear() === lastMonthDate.getFullYear();
      }).length || 0;
      
      const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : '0';
      
      return {
        total: certificates?.length || 0,
        active: certificates?.filter(c => !c.revoked_at).length || 0,
        thisMonth,
        growth
      };
    },
    enabled: !!profile?.institution_id
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track certificate issuance and performance metrics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Certificates</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">Not revoked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">Issued in {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.growth || 0}%</div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Issuance</CardTitle>
            <CardDescription>Monthly certificate issuance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Issuers</CardTitle>
            <CardDescription>Most active certificate issuers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-2" />
                <p>Issuer rankings coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
