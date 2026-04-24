import { useState, useEffect } from "react";
import { Shield, Key, CheckCircle, Copy, ExternalLink, Loader2, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Link, useNavigate } from "react-router-dom";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { hederaService } from "@/lib/hedera/service";

const DidSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dashboardPath } = useRoleBasedNavigation();
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [did, setDid] = useState<string | null>(null);
  const [hederaAccountId, setHederaAccountId] = useState("");

  useEffect(() => {
    checkExistingDID();
  }, [user]);

  const checkExistingDID = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('did, hedera_account_id')
        .eq('id', user.id)
        .single();

      if (profile?.did && profile.did !== 'pending') {
        setDid(profile.did);
        setHederaAccountId(profile.hedera_account_id || '');
      }
    } catch (error) {
      console.error('Error checking existing DID:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleCreateDid = async () => {
    if (!user) {
      toast.error("Please sign in to create a DID");
      return;
    }

    if (!hederaAccountId) {
      toast.error("Please enter your Hedera Account ID");
      return;
    }

    // Validate Hedera account ID format
    if (!/^\d+\.\d+\.\d+$/.test(hederaAccountId)) {
      toast.error("Invalid Hedera Account ID format. Expected format: 0.0.xxxxx");
      return;
    }

    setLoading(true);
    try {
      toast.info("Creating your DID on Hedera blockchain...");

      // Call Hedera edge function to create DID
      const data = await hederaService.createDID({
        userAccountId: hederaAccountId,
        network: 'testnet', // Change to 'mainnet' for production
      });

      console.log('DID creation response:', { data });

      // Verify DID was created
      if (!data.did) {
        throw new Error('DID was not returned in the response');
      }

      setDid(data.did);

      // Update user profile with DID and Hedera account
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          did: data.did,
          hedera_account_id: hederaAccountId
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        toast.warning("DID created but failed to update profile. Please contact support.");
      } else {
        toast.success("DID created successfully!");

        // Log additional info if available
        if ((data as any).didDocument) {
          console.log('DID Document:', (data as any).didDocument);
        }
        if ((data as any).topicId) {
          console.log('HCS Topic ID:', (data as any).topicId);
        }
        if ((data as any).explorerUrl) {
          console.log('Explorer URL:', (data as any).explorerUrl);
        }
      }
    } catch (error: any) {
      console.error("Error creating DID:", error);

      // Provide user-friendly error messages
      let errorMessage = "Failed to create DID";

      if (error.message?.includes('Invalid Hedera account')) {
        errorMessage = "Invalid Hedera Account ID. Please verify your account ID is correct.";
      } else if (error.message?.includes('credentials not configured')) {
        errorMessage = "Hedera service is not properly configured. Please contact support.";
      } else if (error.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                CertChain
              </span>
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link to={dashboardPath}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Key className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Decentralized Identity</h1>
            <p className="text-muted-foreground text-lg">
              Create your DID on Hedera blockchain for secure, verifiable credentials
            </p>
          </div>

          {checkingExisting ? (
            <Card className="p-8 text-center gradient-card shadow-elevated">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Checking for existing DID...</p>
            </Card>
          ) : (
            <Card className="p-8">
              {!did ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Create Your DID</h2>
                    <p className="text-muted-foreground mb-6">
                      A DID is your unique identifier on the Hedera network. It's used to
                      issue and verify credentials securely.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountId">Hedera Account ID</Label>
                    <Input
                      id="accountId"
                      placeholder="0.0.xxxxx"
                      value={hederaAccountId}
                      onChange={(e) => setHederaAccountId(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your Hedera Account ID to associate with your DID
                    </p>
                  </div>

                  <Button
                    onClick={handleCreateDid}
                    disabled={loading || !hederaAccountId}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating DID...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Create DID
                      </>
                    )}
                  </Button>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      What is a DID?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      A Decentralized Identifier (DID) is a W3C standard for creating
                      verifiable, self-sovereign digital identities. Your DID is anchored
                      on the Hedera network, making it tamper-proof and globally resolvable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">DID Created Successfully!</h2>
                    <p className="text-muted-foreground">
                      Your decentralized identifier is now active on Hedera
                    </p>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm text-muted-foreground">Your DID</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 font-mono text-sm break-all">{did}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(did)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <Link to="/dashboard">
                        Go to Dashboard
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <a
                        href={`https://hashscan.io/testnet/account/${hederaAccountId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DidSetup;
