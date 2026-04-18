import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, CheckCircle2, Search, ArrowRight, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VerificationData {
  issuer: string;
  recipient: string;
  tokenId: string;
  serialNumber: string;
}

export default function VerifyStatus() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  const steps = [
    { label: "Connecting to Hedera Testnet...", progress: 20 },
    { label: "Querying Mirror Node...", progress: 45 },
    { label: "Retrieving HCS logs...", progress: 70 },
    { label: "Verifying issuer signature...", progress: 90 },
    { label: "Verification complete", progress: 100 },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status !== "verifying") return;

    let isMounted = true;
    let stepIndex = 0;

    // Simulate stepping through progress
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        setProgress(steps[stepIndex].progress);
        setCurrentStep(stepIndex);
        stepIndex++;
      }
    }, 400);

    // Mock real verification call
    const performVerification = async () => {
      try {
        // In a real implementation:
        // const result = await fetchVerificationResult(verificationId);
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (isMounted) {
          clearInterval(progressInterval);
          setProgress(100);
          setCurrentStep(steps.length - 1);

          // Using dummy verification data
          setVerificationData({
            issuer: "Global Tech University (0.0.45321)",
            recipient: "Jane Doe (user_jane@example.com)",
            tokenId: "0.0.7891234",
            serialNumber: "42"
          });
          setStatus("success");
        }
      } catch (error) {
        if (isMounted) {
          clearInterval(progressInterval);
          console.error(error);
          setStatus("error");
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
    };
  }, [verificationId, status, steps.length]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-neon/5 via-background to-background pointer-events-none" />

        <div className="max-w-2xl w-full relative z-10 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Verification Status</h1>
            <p className="text-muted-foreground font-mono">ID: {verificationId}</p>
          </div>

          <Card className="glass-panel border-white/10">
            <CardContent className="p-8">
              {status === "verifying" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-brand-neon animate-spin" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">{steps[currentStep]?.label}</span>
                      <span className="text-brand-neon">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/5" indicatorClassName="bg-brand-neon" />
                  </div>
                </div>
              )}

              {status === "success" && verificationData && (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-neon/10 text-brand-neon shadow-[0_0_30px_rgba(0,255,102,0.3)]">
                    <ShieldCheck className="w-12 h-12" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Verified Authentic</h2>
                    <p className="text-muted-foreground">This certificate is cryptographically valid and logged on the Hedera network.</p>
                  </div>

                  <div className="bg-black/30 rounded-lg p-4 border border-white/5 text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-neon mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Issuer</p>
                        <p className="text-xs text-muted-foreground">{verificationData.issuer}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-neon mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Recipient</p>
                        <p className="text-xs text-muted-foreground">{verificationData.recipient}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-neon mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Hedera Token ID</p>
                        <p className="text-xs text-brand-neon/80 font-mono break-all">{verificationData.tokenId} - Serial #{verificationData.serialNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate("/verify")}>
                      <Search className="w-4 h-4 mr-2" />
                      Verify Another
                    </Button>
                    <Link to={`/certificates/${verificationId}`}>
                      <Button className="bg-brand-neon text-black hover:bg-brand-neon/90 hover:shadow-[0_0_15px_rgba(0,255,102,0.4)]">
                        View Certificate Detail
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <XCircle className="w-12 h-12" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h2>
                    <p className="text-muted-foreground">We could not verify this certificate on the Hedera network.</p>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <Button variant="outline" onClick={() => navigate("/verify")}>
                      <Search className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
