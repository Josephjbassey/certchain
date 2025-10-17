import { useState } from "react";
import { Shield, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const TwoFactor = () => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSession } = useAuth();
  const email = location.state?.email; // Passed from login page

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error("Session error. Please try logging in again.");
      setIsLoading(false);
      navigate("/auth/login");
      return;
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'totp',
      });

      if (error) {
        throw new Error(error.message || "Invalid 2FA code.");
      }

      if (data.session) {
        await refreshSession(); // Update the auth context
        toast.success("2FA verified successfully!");
        navigate("/dashboard"); // This will now redirect based on role
      } else {
        throw new Error("Verification failed. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Shield className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Two-Factor Authentication</h1>
          <p className="text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
        </div>

        <Card className="p-8 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Authentication Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pl-10 text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Open your authenticator app to view your authentication code
              </p>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : "Verify"}
            </Button>

            <div className="text-center space-y-2">
              <button type="button" className="text-sm text-primary hover:underline">
                Use backup code
              </button>
              <p className="text-xs text-muted-foreground">
                Lost access?{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link to="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TwoFactor;
