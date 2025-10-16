import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Award, Activity } from "lucide-react";

const AdminDashboard = () => {
  const { data: usersCount } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      // @ts-ignore - Supabase types not generated
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: institutionsCount } = useQuery({
    queryKey: ['admin-institutions-count'],
    queryFn: async () => {
      // @ts-ignore - Supabase types not generated
      const { count } = await supabase.from('institutions').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: certificatesCount } = useQuery({
    queryKey: ['admin-certificates-count'],
    queryFn: async () => {
      // @ts-ignore - Supabase types not generated
      const { count } = await supabase.from('certificate_cache').select('*', { count: 'exact', head: true });
      return count || 0;
    }
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['admin-recent-activity'],
    queryFn: async () => {
      // @ts-ignore
      const { data } = await supabase.from('certificate_cache')
        .select('issued_at, course_name, issuer_did')
        .order('issued_at', { ascending: false })
        .limit(5);
      return data || [];
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and statistics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institutions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutionsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificatesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity?.map((activity: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0">
                <div>
                  <p className="font-medium">{activity.course_name}</p>
                  <p className="text-sm text-muted-foreground">Issued by {activity.issuer_did?.slice(0, 20)}...</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(activity.issued_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
