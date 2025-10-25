import { Shield, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VerifyEmail = () => {
  const location = useLocation();
  const email = location.state?.email;

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found. Please go back to signup.");
      return;
    }
    await supabase.auth.resend({ type: 'signup', email });
    toast.success(`Verification email resent to ${email}!`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/images/logo.png" alt="CertChain" className="h-20" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
          <p className="text-muted-foreground">We've sent a verification link to your email</p>
        </div>

        <Card className="p-8 shadow-elevated text-center space-y-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              We've sent a verification email to <br />
              <span className="font-medium text-foreground">
                {email || "your email address"}
              </span>
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Click the link in the email to verify your account and get started with CertChain.
            </p>

            <Button variant="outline" onClick={handleResend} className="w-full" disabled={!email}>
              <RefreshCw className="h-4 w-4" />
              <span className="ml-2">Resend Verification Email</span>
            </Button>
          </div>

          <div className="pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Having trouble? Contact{" "}
              <Link to="/contact" className="text-primary hover:underline">
                support
              </Link>
            </p>
          </div>
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

export default VerifyEmail;
