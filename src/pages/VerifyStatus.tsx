import { useParams, Link } from "react-router-dom";
import { Shield, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const VerifyStatus = () => {
  const { verificationId } = useParams();

  // Mock verification status - in production, fetch from backend
  const status = {
    id: verificationId,
    status: "processing", // processing | completed | failed
    certificateId: "cert-001",
    progress: 65,
    steps: [
      { name: "Blockchain Lookup", status: "completed" },
      { name: "NFT Verification", status: "completed" },
      { name: "IPFS Metadata Fetch", status: "in_progress" },
      { name: "DID Verification", status: "pending" },
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-6">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Verifying Certificate</h1>
          <p className="text-muted-foreground text-lg">
            Please wait while we verify the certificate on the blockchain
          </p>
        </div>

        <Card className="p-8 space-y-6 shadow-elevated">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verification Progress</span>
              <span className="font-medium">{status.progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-hero transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {status.steps.map((step) => (
              <div key={step.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                {step.status === "completed" && (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                )}
                {step.status === "in_progress" && (
                  <Loader2 className="h-5 w-5 text-primary flex-shrink-0 animate-spin" />
                )}
                {step.status === "pending" && (
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                    {step.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border/40">
            <p className="text-sm text-muted-foreground text-center">
              Verification ID: <span className="font-mono">{verificationId}</span>
            </p>
          </div>
        </Card>

        <div className="text-center mt-8">
          <Link to="/verify">
            <Button variant="ghost">Back to Verify</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyStatus;
