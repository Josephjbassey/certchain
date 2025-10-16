import { useState } from "react";
import { Shield, Search, ScanLine, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Verify = () => {
  const [certificateId, setCertificateId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      toast.error("Please enter a certificate ID");
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification - In production, this calls Hedera + IPFS
    setTimeout(() => {
      // Mock verification result
      setVerificationResult({
        valid: true,
        certificate: {
          id: certificateId,
          recipientName: "John Doe",
          courseName: "Advanced Blockchain Development",
          institution: "Hedera Institute of Technology",
          issuedDate: "2025-01-15",
          serialNumber: "0.0.123456:7890",
          ipfsCid: "QmX7J9K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1",
          issuerDid: "did:hedera:testnet:z6Mk...",
        }
      });
      setIsVerifying(false);
      toast.success("Certificate verified successfully!");
    }, 2000);
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
          <Link to="/">
            <Button variant="ghost" size="sm">Back to Home</Button>
          </Link>
        </div>
      </header>

      {/* Verify Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full gradient-hero mb-6 shadow-glow">
              <Shield className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Verify Certificate</h1>
            <p className="text-muted-foreground text-lg">
              Enter a certificate ID or scan a QR code to verify authenticity on the blockchain
            </p>
          </div>

          <Card className="p-8 space-y-6 shadow-elevated">
            <div className="space-y-4">
              <label className="text-sm font-medium">Certificate ID</label>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter certificate ID (e.g., 0.0.123456:7890)"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  className="flex-1"
                />
                <Button 
                  variant="hero" 
                  onClick={handleVerify}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Clock className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-2">Verify</span>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Link to="/verify/scan">
              <Button variant="outline" className="w-full" size="lg">
                <ScanLine className="h-5 w-5" />
                <span className="ml-2">Scan QR Code</span>
              </Button>
            </Link>
          </Card>

          {/* Verification Result */}
          {verificationResult && (
            <Card className="mt-8 p-8 space-y-6 gradient-card border-border/50 shadow-elevated cert-shine">
              <div className="flex items-center gap-3">
                {verificationResult.valid ? (
                  <>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Certificate Valid</h3>
                      <p className="text-sm text-muted-foreground">Verified on Hedera blockchain</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <XCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Certificate Invalid</h3>
                      <p className="text-sm text-muted-foreground">Not found or revoked</p>
                    </div>
                  </>
                )}
              </div>

              {verificationResult.valid && verificationResult.certificate && (
                <div className="border-t border-border/40 pt-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Recipient</p>
                      <p className="font-medium">{verificationResult.certificate.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Course</p>
                      <p className="font-medium">{verificationResult.certificate.courseName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Institution</p>
                      <p className="font-medium">{verificationResult.certificate.institution}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                      <p className="font-medium">{verificationResult.certificate.issuedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Serial Number</p>
                      <p className="font-mono text-sm">{verificationResult.certificate.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">IPFS CID</p>
                      <p className="font-mono text-sm truncate">{verificationResult.certificate.ipfsCid}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link to={`/verify/${verificationResult.certificate.id}`}>
                      <Button variant="outline" className="w-full">
                        View Full Certificate Details
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-12">
            <Card className="p-6 text-center space-y-2">
              <Shield className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Blockchain Verified</h3>
              <p className="text-sm text-muted-foreground">Immutable proof on Hedera ledger</p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <Clock className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Instant Results</h3>
              <p className="text-sm text-muted-foreground">Verify in seconds</p>
            </Card>
            <Card className="p-6 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Always Available</h3>
              <p className="text-sm text-muted-foreground">24/7 global verification</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Verify;
