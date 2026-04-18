import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  FileText,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  Award,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalIssued: 0,
    activeRecipients: 0,
    recentActivity: 0,
    totalHcsLogs: 0
  });

  // Placeholder for real stats fetching
  useEffect(() => {
    // In a real app, this would fetch from Supabase
    setStats({
      totalIssued: 142,
      activeRecipients: 89,
      recentActivity: 12,
      totalHcsLogs: 142
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground flex items-center mt-1">
            <ShieldCheck className="w-4 h-4 mr-2 text-brand-neon" />
            Connected to Hedera Testnet
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/issue">
            <Button className="bg-brand-neon text-black hover:bg-brand-neon/90 transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)]">
              <PlusCircle className="mr-2 h-4 w-4" />
              Issue Certificate
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card bg-card border-brand-neon/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <Award className="h-4 w-4 text-brand-neon" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssued}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRecipients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hedera Consensus Logs</CardTitle>
            <Activity className="h-4 w-4 text-brand-neon" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHcsLogs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              100% synchronized
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actions in last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
            <CardDescription>
              The latest certificates issued by your institution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder Content */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-neon/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-neon" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Advanced Web3 Development</p>
                      <p className="text-xs text-muted-foreground">Issued to user_{i}@example.com</p>
                    </div>
                  </div>
                  <div className="text-xs text-brand-neon flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/certificates">
                <Button variant="outline" className="w-full">View All Certificates</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Hybrid architecture health monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 text-blue-400">DB</div>
                  <div>
                    <p className="font-medium text-sm">Supabase Metadata Layer</p>
                    <p className="text-xs text-muted-foreground">Operational • 45ms ping</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-brand-neon/20 shadow-[inset_0_0_10px_rgba(0,255,102,0.05)]">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-brand-neon" />
                  <div>
                    <p className="font-medium text-sm">Hedera Consensus Service</p>
                    <p className="text-xs text-muted-foreground">Operational • Testnet</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-brand-neon animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
