import { Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useMyCertificates } from "@/hooks/useCertificates";
import { Skeleton } from "@/components/ui/skeleton";

const MyCertificates = () => {
  const { data: certificates, isLoading } = useMyCertificates();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Back</Button>
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-muted-foreground">Certificates you've received</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-20 w-full" />
              </Card>
            ))
          ) : certificates?.length === 0 ? (
            <Card className="p-12 text-center">
              <Award className="h-16 w-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
              <p className="text-muted-foreground">
                Certificates issued to your Hedera account will appear here
              </p>
            </Card>
          ) : (
            certificates?.map((cert) => (
              <Card key={cert.id} className="p-6 hover:shadow-elevated transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg gradient-accent flex items-center justify-center">
                      <Award className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{cert.course_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Issued on {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        Serial: {cert.token_id}:{cert.serial_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      {cert.revoked_at ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                          Revoked
                        </span>
                      ) : cert.expires_at && new Date(cert.expires_at) < new Date() ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground">
                          Expired
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <Link to={`/dashboard/my-certificates/${cert.certificate_id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCertificates;
