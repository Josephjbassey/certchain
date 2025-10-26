import { useState, useEffect } from "react";
import { Shield, Mail, Lock, User, Building, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useAuth } from "@/lib/auth-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  institutionId: z.string().uuid("Please select an institution").optional(),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    institutionId: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get("invitationToken");
  const [invitationData, setInvitationData] = useState<{ email: string; institution_id: string } | null>(null);

  // Fetch verified institutions for dropdown
  const { data: institutions, isLoading: isLoadingInstitutions } = useQuery({
    queryKey: ['verified-institutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('id, name, domain')
        .eq('verified', true)
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // Handle invitation token
  useEffect(() => {
    if (invitationToken) {
      const validateToken = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('invitations')
          .select('email, institution_id, expires_at, used_at, role')
          .eq('token', invitationToken)
          .maybeSingle();

        if (error || !data) {
          toast.error("Invalid invitation link.");
          navigate("/auth/signup");
          setIsLoading(false);
          return;
        }

        // Check if invitation was already used
        if (data.used_at) {
          toast.error("This invitation has already been used.");
          navigate("/auth/signup");
          setIsLoading(false);
          return;
        }

        // Check if invitation has expired
        if (new Date(data.expires_at) < new Date()) {
          toast.error("This invitation has expired. Please request a new one.");
          navigate("/auth/signup");
          setIsLoading(false);
          return;
        }

        // Valid invitation
        setInvitationData(data);
        setFormData(prev => ({ ...prev, email: data.email }));
        toast.info(`You have been invited to join as ${data.role}. Please complete your registration.`);
        setIsLoading(false);
      };
      validateToken();
    }
  }, [invitationToken, navigate]);

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = signupSchema.parse({
        name: formData.name.trim(),
        institutionId: invitationData ? invitationData.institution_id : formData.institutionId,
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      const redirectUrl = `${window.location.origin}/dashboard`;

      // Prepare options for Supabase Auth
      const signUpOptions: any = {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: validated.name,
          institution_id: validated.institutionId,
        },
      };

      if (invitationToken) {
        signUpOptions.data.invitation_token = invitationToken;
      }

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: signUpOptions,
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("An account with this email already exists");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Mark invitation as used if signup was via invitation
      if (invitationToken && data.user) {
        try {
          await supabase
            .from('invitations')
            .update({ used_at: new Date().toISOString() })
            .eq('token', invitationToken);
        } catch (invError) {
          console.error("Failed to mark invitation as used:", invError);
          // Don't block signup if this fails
        }
      }

      if (data.session) {
        toast.success("Account created successfully!");
        navigate("/dashboard"); // Should redirect to role-based dashboard
      } else {
        navigate("/auth/verify-email", { state: { email: validated.email } });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred during sign up");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/images/logo.png" alt="CertChain" className="h-20" />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Start issuing blockchain certificates</p>
        </div>

        <Card className="p-8 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {!invitationToken && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Institution</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select
                    value={formData.institutionId}
                    onValueChange={(value) => setFormData({ ...formData, institutionId: value })}
                    disabled={isLoadingInstitutions || !!invitationToken}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder={isLoadingInstitutions ? "Loading institutions..." : "Select your institution"} />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions && institutions.length > 0 ? (
                        institutions.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name} {inst.domain && `(${inst.domain})`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No institutions available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {institutions && institutions.length === 0 && !isLoadingInstitutions && (
                  <p className="text-xs text-muted-foreground">
                    Your institution is not listed? Contact support to get your institution verified.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  disabled={!!invitationToken}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="rounded border-border mt-1" required />
              <label className="text-muted-foreground">
                I agree to the{" "}
                <Link to="/settings/privacy" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/settings/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isLoading || isLoadingInstitutions}>
              <UserPlus className="h-4 w-4" />
              <span className="ml-2">{isLoading ? "Creating account..." : "Create Account"}</span>
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
