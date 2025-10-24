import { useParams, Link } from "react-router-dom";
import { Shield, Award, Download, Share2, Ban, MoreHorizontal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const CertificateDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: certificate, isLoading } = useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data } = await supabase
        .from('certificate_cache')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (data) {
        const metadata = data.metadata as any || {};
        return {
          id: data.id,
          recipientName: data.recipient_name || 'N/A',
          recipientEmail: data.recipient_email || 'N/A',
          recipientDid: data.recipient_did || 'Not available',
          courseName: data.course_name || 'Unknown Course',
          issuedDate: data.minted_at || data.created_at,
          serialNumber: `${data.token_id || '0.0.0'}:${data.serial_number || '0'}`,
          tokenId: data.token_id || 'Not minted',
          ipfsCid: data.ipfs_cid || 'Not uploaded',
          transactionId: data.transaction_id || 'Pending',
          status: data.status || 'pending',
          skills: metadata.skills || [],
        };
      }
      return null;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate details...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The certificate with ID {id} could not be found.
          </p>
          <Link to="/dashboard/certificates">
            <Button>Back to Certificates</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <Link to="/dashboard/certificates">
            <Button variant="ghost" size="sm">Back to Certificates</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Certificate Details</h1>
            <p className="text-muted-foreground">ID: {id}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center gradient-card shadow-elevated">
            <Award className="h-10 w-10 text-primary mx-auto mb-3" />
            <p className="text-2xl font-bold capitalize">{certificate.status}</p>
            <p className="text-sm text-muted-foreground">Certificate Status</p>
          </Card>
          <Card className="p-6 text-center gradient-card shadow-elevated">
            <p className="text-2xl font-bold">-</p>
            <p className="text-sm text-muted-foreground">Verifications</p>
          </Card>
          <Card className="p-6 text-center gradient-card shadow-elevated">
            <p className="text-2xl font-bold">-</p>
            <p className="text-sm text-muted-foreground">Shares</p>
          </Card>
        </div>

        <Card className="p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">{certificate.courseName}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recipient Name</p>
                <p className="font-medium">{certificate.recipientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recipient Email</p>
                <p className="font-medium">{certificate.recipientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recipient DID</p>
                <p className="font-mono text-sm">{certificate.recipientDid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Issue Date</p>
                <p className="font-medium">
                  {certificate.issuedDate 
                    ? new Date(certificate.issuedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {certificate.skills && certificate.skills.length > 0 && (
            <div className="border-t border-border/40 pt-6">
              <h3 className="font-semibold mb-4">Skills & Topics</h3>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border/40 pt-6">
            <h3 className="font-semibold mb-4">Blockchain Details</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Serial Number</p>
                <p className="font-mono text-sm">{certificate.serialNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Token ID</p>
                <p className="font-mono text-sm">{certificate.tokenId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm truncate">{certificate.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">IPFS CID</p>
                <p className="font-mono text-sm truncate">{certificate.ipfsCid}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="hero" className="flex-1">
              <Download className="h-4 w-4" />
              <span className="ml-2">Download Certificate</span>
            </Button>
            {certificate.transactionId !== 'Pending' && (
              <Button variant="outline" asChild>
                <a 
                  href={`https://hashscan.io/testnet/transaction/${certificate.transactionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="ml-2">View on Explorer</span>
                </a>
              </Button>
            )}
          </div>

          <div className="border-t border-border/40 pt-6">
            <h3 className="font-semibold mb-4 text-destructive">Danger Zone</h3>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={certificate.status === 'revoked'}
            >
              <Ban className="h-4 w-4" />
              <span className="ml-2">
                {certificate.status === 'revoked' ? 'Certificate Revoked' : 'Revoke Certificate'}
              </span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CertificateDetail;
