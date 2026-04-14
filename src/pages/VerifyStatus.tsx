import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, CheckCircle2, Search, ArrowRight, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { hederaService } from "@/lib/hedera/service";
import { toast } from "sonner";
import type { VerificationResult } from "@/lib/hedera/types";

export default function VerifyStatus() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [verificationData, setVerificationData] = useState<VerificationResult | null>(null);

  const steps = [
    { label: "Connecting to Hedera Testnet...", progress: 20 },
    { label: "Querying Mirror Node...", progress: 45 },
    { label: "Retrieving HCS logs...", progress: 70 },
    { label: "Verifying issuer signature...", progress: 90 },
    { label: "Verification complete", progress: 100 },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status !== "verifying" || !verificationId) return;

    const performVerification = async () => {
      let stepIndex = 0;

      const interval = setInterval(() => {
        if (stepIndex < steps.length - 1) {
          setProgress(steps[stepIndex].progress);
          setCurrentStep(stepIndex);
          stepIndex++;
        }
      }, 600);

      try {
        // Perform actual verification
        const result = await hederaService.verifyCertificate(verificationId);

        clearInterval(interval);
        setProgress(100);
        setCurrentStep(steps.length - 1);
        setVerificationData(result);

        if (result.verified) {
          setStatus("success");
        } else {
          setStatus("error");
          toast.error(result.message || "Certificate verification failed");
        }
      } catch (error) {
        clearInterval(interval);
        console.error("Verification error:", error);
        setStatus("error");
        toast.error("Failed to verify certificate");
      }
    };

    performVerification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, verificationId]);

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
              {status === "verifying" ? (
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
              ) : status === "success" ? (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-neon/10 text-brand-neon shadow-[0_0_30px_rgba(0,255,102,0.3)]">
                    <ShieldCheck className="w-12 h-12" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Verified Authentic</h2>
                    <p className="text-muted-foreground">This certificate is cryptographically valid and logged on the Hedera network.</p>
                  </div>

                  {verificationData && (
                    <div className="bg-black/30 rounded-lg p-4 border border-white/5 text-left space-y-3">
                      {verificationData.issuerName && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-neon mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Issuer</p>
                            <p className="text-xs text-muted-foreground">
                              {verificationData.issuerName}
                              {verificationData.issuerDid && ` (${verificationData.issuerDid})`}
                            </p>
                          </div>
                        </div>
                      )}
                      {verificationData.recipientEmail && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-neon mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Recipient</p>
                            <p className="text-xs text-muted-foreground">{verificationData.recipientEmail}</p>
                          </div>
                        </div>
                      )}
                      {verificationData.tokenId && (
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-brand-neon mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Hedera Token ID</p>
                            <p className="text-xs text-brand-neon/80 font-mono break-all">
                              {verificationData.tokenId}
                              {verificationData.serialNumber && ` - Serial #${verificationData.serialNumber}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate("/verify")}>
                      <Search className="w-4 h-4 mr-2" />
                      Verify Another
                    </Button>
                    {verificationData?.certificateId && (
                      <Button
                        className="bg-brand-neon text-black hover:bg-brand-neon/90 hover:shadow-[0_0_15px_rgba(0,255,102,0.4)]"
                        onClick={() => navigate(`/certificate/${verificationData.certificateId}`)}
                      >
                        View Certificate Detail
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-destructive/10 text-destructive">
                    <XCircle className="w-12 h-12" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h2>
                    <p className="text-muted-foreground">
                      {verificationData?.message || "Unable to verify this certificate. It may not exist or has been revoked."}
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" onClick={() => navigate("/verify")}>
                      <Search className="w-4 h-4 mr-2" />
                      Try Another Certificate
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