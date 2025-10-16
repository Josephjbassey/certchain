import { useParams, Link } from "react-router-dom";
import { Shield, Award, Download, Share2, Ban, MoreHorizontal, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CertificateDetail = () => {
  const { id } = useParams();

  // Mock data
  const certificate = {
    id,
    recipientName: "Alice Johnson",
    recipientEmail: "alice@example.com",
    recipientDid: "did:hedera:testnet:z6Mk...",
    courseName: "Advanced Blockchain Development",
    issuedDate: "2025-01-15T10:30:00Z",
    serialNumber: "0.0.123456:7890",
    tokenId: "0.0.123456",
    ipfsCid: "QmX7J9K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1",
    transactionId: "0.0.123456@1705315800.123456789",
    status: "active",
    skills: ["Smart Contracts", "Hedera SDK", "DApp Development"],
  };

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
            <p className="text-2xl font-bold">Active</p>
            <p className="text-sm text-muted-foreground">Certificate Status</p>
          </Card>
          <Card className="p-6 text-center gradient-card shadow-elevated">
            <p className="text-2xl font-bold">15</p>
            <p className="text-sm text-muted-foreground">Verifications</p>
          </Card>
          <Card className="p-6 text-center gradient-card shadow-elevated">
            <p className="text-2xl font-bold">3</p>
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
                <p className="font-medium">{new Date(certificate.issuedDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

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
            <Button variant="outline">
              <ExternalLink className="h-4 w-4" />
              <span className="ml-2">View on Explorer</span>
            </Button>
          </div>

          <div className="border-t border-border/40 pt-6">
            <h3 className="font-semibold mb-4 text-destructive">Danger Zone</h3>
            <Button variant="destructive" className="w-full">
              <Ban className="h-4 w-4" />
              <span className="ml-2">Revoke Certificate</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CertificateDetail;
