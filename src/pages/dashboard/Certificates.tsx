import { Shield, Award, Search, Filter, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useCertificates } from "@/hooks/useCertificates";
import { Skeleton } from "@/components/ui/skeleton";

const Certificates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: certificates, isLoading } = useCertificates();

  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    if (!searchTerm) return certificates;
    
    const search = searchTerm.toLowerCase();
    return certificates.filter(cert => 
      cert.course_name.toLowerCase().includes(search) ||
      cert.recipient_email?.toLowerCase().includes(search) ||
      cert.recipient_account_id?.toLowerCase().includes(search) ||
      cert.certificate_id.toLowerCase().includes(search)
    );
  }, [certificates, searchTerm]);

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
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link to="/settings/account">
              <Button variant="outline" size="sm">Settings</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Certificates</h1>
            <p className="text-muted-foreground">Manage and track all issued certificates</p>
          </div>
          <Link to="/dashboard/issue">
            <Button variant="hero" className="mt-4 md:mt-0">
              Issue New Certificate
            </Button>
          </Link>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
              <span className="ml-2">Filters</span>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4" />
              <span className="ml-2">Export</span>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4 rounded-lg border border-border/50">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))
            ) : filteredCertificates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm ? 'No certificates found' : 'No certificates yet'}
                </p>
                <p className="text-sm">
                  {searchTerm ? 'Try a different search term' : 'Start by issuing your first certificate'}
                </p>
              </div>
            ) : (
              filteredCertificates.map((cert) => (
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
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Certificates;
