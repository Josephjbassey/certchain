import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Shield, Clock, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicHeader } from "@/components/PublicHeader";

interface VerificationStep {
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

const VerifyStatus = () => {
  const { verificationId } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [steps, setSteps] = useState<VerificationStep[]>([
    { name: "Blockchain Lookup", status: 'pending' },
    { name: "NFT Verification", status: 'pending' },
    { name: "IPFS Metadata Fetch", status: 'pending' },
    { name: "DID Verification", status: 'pending' },
  ]);

  useEffect(() => {
    // Simulate real-time verification process
    let currentStep = 0;
    const stepDuration = 1500; // 1.5 seconds per step
    
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setSteps(prev => {
          const newSteps = [...prev];
          if (currentStep > 0) {
            newSteps[currentStep - 1].status = 'completed';
          }
          newSteps[currentStep].status = 'in_progress';
          return newSteps;
        });
        
        setProgress(Math.round(((currentStep + 1) / steps.length) * 100));
        currentStep++;
      } else {
        // All steps complete
        setSteps(prev => prev.map(step => ({ ...step, status: 'completed' })));
        setProgress(100);
        setStatus('completed');
        clearInterval(interval);
        
        // Redirect to certificate detail after completion
        setTimeout(() => {
          navigate(`/verify/${verificationId}`);
        }, 1000);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [verificationId, navigate]);

  const getStepIcon = (stepStatus: VerificationStep['status']) => {
    switch (stepStatus) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />;
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-primary flex-shrink-0 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

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
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-hero transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                {getStepIcon(step.status)}
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
