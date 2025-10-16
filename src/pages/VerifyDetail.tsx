import { useParams, Link } from "react-router-dom";
import { Shield, CheckCircle2, Calendar, User, Building, FileText, Download, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const VerifyDetail = () => {
  const { certificateId } = useParams();

  // Mock certificate data - in production, fetch from Hedera
  const certificate = {
    id: certificateId,
    recipientName: "John Doe",
    recipientDid: "did:hedera:testnet:z6Mk...",
    courseName: "Advanced Blockchain Development",
    institution: "Hedera Institute of Technology",
    institutionDid: "did:hedera:testnet:z8Hs...",
    issuedDate: "2025-01-15T10:30:00Z",
    expiresAt: null,
    serialNumber: "0.0.123456:7890",
    tokenId: "0.0.123456",
    ipfsCid: "QmX7J9K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1",
    transactionId: "0.0.123456@1705315800.123456789",
    status: "valid",
    skills: ["Smart Contracts", "Hedera SDK", "DApp Development"],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
          <Link to="/verify">
            <Button variant="ghost" size="sm">Back to Verify</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Status Banner */}
        <Card className="p-6 mb-8 gradient-card border-primary/20 shadow-elevated">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Certificate Verified</h1>
              <p className="text-muted-foreground">This certificate is valid and has been verified on Hedera blockchain</p>
            </div>
          </div>
        </Card>

        {/* Certificate Details */}
        <Card className="p-8 space-y-8 cert-shine">
          <div className="text-center border-b border-border/40 pb-6">
            <h2 className="text-3xl font-bold mb-2">{certificate.courseName}</h2>
            <p className="text-muted-foreground">Certificate of Completion</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Recipient</span>
              </div>
              <p className="font-medium text-lg">{certificate.recipientName}</p>
              <p className="text-sm font-mono text-muted-foreground">{certificate.recipientDid}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>Issued By</span>
              </div>
              <p className="font-medium text-lg">{certificate.institution}</p>
              <p className="text-sm font-mono text-muted-foreground">{certificate.institutionDid}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Issue Date</span>
              </div>
              <p className="font-medium">{new Date(certificate.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Serial Number</span>
              </div>
              <p className="font-mono text-sm">{certificate.serialNumber}</p>
            </div>
          </div>

          {certificate.skills && certificate.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Skills & Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border/40 pt-6 space-y-4">
            <h3 className="font-semibold">Blockchain Verification</h3>
            <div className="grid md:grid-cols-2 gap-4">
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
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Valid
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="hero" className="flex-1">
              <Download className="h-4 w-4" />
              <span className="ml-2">Download Certificate</span>
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4" />
              <span className="ml-2">Share</span>
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4" />
              <span className="ml-2">View on IPFS</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyDetail;
