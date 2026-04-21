import { Award, Download, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useMyCertificates } from "@/hooks/useCertificates";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const CandidateDashboard = () => {
  const { data: certificates, isLoading } = useMyCertificates();

  const activeCertificates = certificates?.filter(
    cert => !cert.revoked_at && (!cert.expires_at || new Date(cert.expires_at) >= new Date())
  ) || [];

  const expiredCertificates = certificates?.filter(
    cert => cert.expires_at && new Date(cert.expires_at) < new Date()
  ) || [];

  const revokedCertificates = certificates?.filter(cert => cert.revoked_at) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            View and manage your certificates
          </p>
        </div>
        <Link to="/candidate/my-certificates">
          <Button variant="hero" size="lg" className="mt-4 md:mt-0">
            <Award className="h-5 w-5 mr-2" />
            View All Certificates
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
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
                <p className="text-sm text-muted-foreground">Active Certificates</p>
                <Award className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{activeCertificates.length}</p>
              <p className="text-xs text-muted-foreground">Valid credentials</p>
            </Card>

            <Card className="p-6 space-y-2 gradient-card shadow-elevated hover:shadow-glow transition-smooth">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{certificates?.length || 0}</p>
              <p className="text-xs text-muted-foreground">All time</p>
            </Card>

            <Card className="p-6 space-y-2 gradient-card shadow-elevated hover:shadow-glow transition-smooth">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">On Hedera</p>
                <Download className="h-5 w-5 text-primary" />
              </div>
              <p className="text-3xl font-bold">{certificates?.filter(c => c.token_id).length || 0}</p>
              <p className="text-xs text-muted-foreground">NFT certificates</p>
            </Card>
          </>
        )}
      </div>

      {/* Recent Certificates */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Certificates</CardTitle>
            <Link to="/candidate/my-certificates">
              <Button variant="ghost" size="sm">
                View All
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : certificates && certificates.length > 0 ? (
            <div className="space-y-4">
              {certificates.slice(0, 5).map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg gradient-accent flex items-center justify-center">
                      <Award className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{cert.course_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Issued {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                      {cert.token_id && cert.serial_number && (
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {cert.token_id}:{cert.serial_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {cert.revoked_at ? (
                      <Badge variant="destructive">Revoked</Badge>
                    ) : cert.expires_at && new Date(cert.expires_at) < new Date() ? (
                      <Badge variant="secondary">Expired</Badge>
                    ) : (
                      <Badge>Active</Badge>
                    )}
                    <Link to={`/candidate/my-certificates/${cert.certificate_id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
              <p className="text-muted-foreground mb-4">
                Certificates issued to you will appear here
              </p>
              <p className="text-sm text-muted-foreground">
                Make sure your Hedera account is connected in settings
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      {certificates && certificates.length > 0 && (
        <div className="grid md:grid-cols-3 gap-6">
          {expiredCertificates.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Expired</h3>
              <p className="text-2xl font-bold">{expiredCertificates.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Certificates past expiration date
              </p>
            </Card>
          )}
          {revokedCertificates.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Revoked</h3>
              <p className="text-2xl font-bold text-destructive">{revokedCertificates.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Certificates that have been revoked
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateDashboard;
