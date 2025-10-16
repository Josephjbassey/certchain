import { Award, Users, TrendingUp, Plus, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useCertificateStats, useCertificates } from "@/hooks/useCertificates";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useCertificateStats();
  const { data: certificates, isLoading: certsLoading } = useCertificates();

  const recentCertificates = certificates?.slice(0, 3) || [];

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your certificates and track issuance activity
            </p>
          </div>
          <Link to="/dashboard/issue">
            <Button variant="hero" size="lg" className="mt-4 md:mt-0">
              <Plus className="h-5 w-5" />
              <span className="ml-2">Issue Certificate</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="p-6 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-4 w-28" />
              </Card>
            ))
          ) : (
            <>
              <Card className="p-6 space-y-2 gradient-card shadow-elevated hover:shadow-glow transition-smooth">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total Certificates</p>
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats?.totalCertificates.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </Card>

              <Card className="p-6 space-y-2 gradient-card shadow-elevated hover:shadow-glow transition-smooth">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Active</p>
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats?.activeCertificates.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalCertificates 
                    ? `${((stats.activeCertificates / stats.totalCertificates) * 100).toFixed(1)}% active rate`
                    : 'No data'}
                </p>
              </Card>

              <Card className="p-6 space-y-2 gradient-card shadow-elevated hover:shadow-glow transition-smooth">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Recipients</p>
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats?.recipients.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Unique recipients</p>
              </Card>

              <Card className="p-6 space-y-2 gradient-card shadow-elevated hover:shadow-glow transition-smooth">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Verifications</p>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <p className="text-3xl font-bold">{stats?.verifications.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 space-y-3 hover:shadow-elevated transition-smooth">
            <Award className="h-10 w-10 text-primary" />
            <h3 className="font-semibold text-lg">Issue Certificate</h3>
            <p className="text-sm text-muted-foreground">Create and mint a new certificate NFT</p>
            <Link to="/dashboard/issue">
              <Button variant="outline" className="w-full">Get Started</Button>
            </Link>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-elevated transition-smooth">
            <Users className="h-10 w-10 text-primary" />
            <h3 className="font-semibold text-lg">Batch Upload</h3>
            <p className="text-sm text-muted-foreground">Issue multiple certificates at once</p>
            <Link to="/dashboard/batch-issue">
              <Button variant="outline" className="w-full">Upload CSV</Button>
            </Link>
          </Card>

          <Card className="p-6 space-y-3 hover:shadow-elevated transition-smooth">
            <TrendingUp className="h-10 w-10 text-primary" />
            <h3 className="font-semibold text-lg">Analytics</h3>
            <p className="text-sm text-muted-foreground">View detailed issuance reports</p>
            <Link to="/dashboard/analytics">
              <Button variant="outline" className="w-full">View Reports</Button>
            </Link>
          </Card>
        </div>

        {/* Recent Certificates */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Certificates</h2>
            <Link to="/dashboard/certificates">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {certsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : recentCertificates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No certificates issued yet</p>
              </div>
            ) : (
              recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg gradient-accent flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{cert.recipient_email || cert.recipient_account_id || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{cert.course_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-muted-foreground">Serial</p>
                      <p className="text-sm font-mono">{cert.token_id}:{cert.serial_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Issued</p>
                      <p className="text-sm">{new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {cert.revoked_at ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          Revoked
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <Link to={`/dashboard/certificates/${cert.certificate_id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
  );
};

export default Dashboard;
