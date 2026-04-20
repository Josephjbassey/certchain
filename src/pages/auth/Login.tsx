import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login for pure dApp
    setTimeout(() => {
      signIn({ id: "123", email: "test@example.com" });
      toast.success("Successfully logged in");
      navigate(from, { replace: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-colors">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CertChain</span>
          </Link>
        </div>

        <Card className="glass-panel border-white/10 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to manage your decentralized certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Button type="submit" className="w-full h-12 text-md" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect Wallet (Simulated)"}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-white/5">
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/auth/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <Link to="/auth/forgot-password" className="hover:text-foreground transition-colors">
                Forgot your password?
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
