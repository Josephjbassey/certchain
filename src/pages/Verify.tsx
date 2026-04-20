import { useState } from "react";
import { PublicHeader as Header } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Verify() {
  const [certId, setCertId] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setStatus("verifying");

    // Simulate pinging Hedera Mirror Node
    setTimeout(() => {
      // For demonstration, navigate to the detail page or show status
      // Real implementation would fetch from Hedera
      navigate(`/verify/status/${certId}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
        {/* Cyber-Noir Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-neon/5 via-background to-background pointer-events-none" />

        <div className="glass-panel max-w-xl w-full p-8 md:p-12 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-neon/10 mb-6 relative">
              <ShieldCheck className="w-8 h-8 text-brand-neon z-10" />
              {status === "verifying" && (
                <div className="absolute inset-0 rounded-full animate-pulse-glow" />
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Zero-Trust Verification Gateway
            </h1>
            <p className="text-muted-foreground text-lg">
              Verify certificate authenticity directly against the Hedera Consensus Service.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder="Enter Certificate ID (e.g., 0.0.1234567)"
                className="pl-12 h-14 text-lg bg-black/50 border-white/20 focus:border-brand-neon focus:ring-brand-neon/20 placeholder:text-muted-foreground/50 transition-all"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                disabled={status === "verifying"}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-brand-neon text-black hover:bg-brand-neon/90 hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all"
              disabled={status === "verifying" || !certId.trim()}
            >
              {status === "verifying" ? (
                <span className="flex items-center">
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3" />
                  Pinging Hedera Mirror Node...
                </span>
              ) : (
                "Verify on Hedera"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-neon" />
              Decentralized metadata | Ownership verified via Hedera Consensus
            </p>
          </div>
        </div>
      </main>


    </div>
  );
}
