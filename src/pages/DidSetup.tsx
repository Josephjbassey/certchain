import { useState } from "react";
import { Shield, Key, CheckCircle, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Link } from "react-router-dom";

const DidSetup = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [did, setDid] = useState<string | null>(null);
  const [hederaAccountId, setHederaAccountId] = useState("");

  const handleCreateDid = async () => {
    if (!user) {
      toast.error("Please sign in to create a DID");
      return;
    }

    if (!hederaAccountId) {
      toast.error("Please enter your Hedera Account ID");
      return;
    }

    setLoading(true);
    try {

      // Call Hedera edge function to create DID
      const { data, error } = await supabase.functions.invoke("hedera-create-did", {
        body: { 
          userAccountId: hederaAccountId,
          network: 'testnet' // Change to 'mainnet' for production
        }
      });

      if (error) throw error;

      if (data?.success) {
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
          toast.error("DID created but failed to update profile");
        } else {
          toast.success("DID created successfully!");
        }
      } else {
        throw new Error(data?.error || 'Failed to create DID');
      }
    } catch (error: any) {
      console.error("Error creating DID:", error);
      toast.error(error.message || "Failed to create DID");
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">CertChain</span>
            </Link>
            <Button asChild variant="outline">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Key className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">DID Setup</h1>
            <p className="text-muted-foreground">
              Create your Decentralized Identifier (DID) on Hedera
            </p>
          </div>

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
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DidSetup;
