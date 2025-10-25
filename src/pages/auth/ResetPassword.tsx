import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Shield, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      setSuccess(true);
      toast.success("Password reset successfully!");
      setIsLoading(false);
      
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/images/logo.png" alt="CertChain" className="h-20" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Set New Password</h1>
          <p className="text-muted-foreground">Choose a strong password for your account</p>
        </div>

        <Card className="p-8 shadow-elevated">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Password must contain:</p>
                <ul className="space-y-1 ml-4">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One number</li>
                  <li>• One special character</li>
                </ul>
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading}>
                <Lock className="h-4 w-4" />
                <span className="ml-2">{isLoading ? "Resetting..." : "Reset Password"}</span>
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="font-medium mb-2">Password Reset Successful</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to login...
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
