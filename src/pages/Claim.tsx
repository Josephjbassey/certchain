import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Shield, CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const Claim = () => {
  const { claimToken } = useParams<{ claimToken: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsAssociation, setNeedsAssociation] = useState(false);
  const [associationInstructions, setAssociationInstructions] = useState<any>(null);

  useEffect(() => {
    if (!claimToken) {
      setError("Invalid claim token");
      setLoading(false);
      return;
    }

    verifyClaimToken();
  }, [claimToken]);

  const verifyClaimToken = async () => {
    try {
      // @ts-ignore - Supabase types not generated
      const { data, error } = await supabase.from("claim_tokens").select("*, certificate_id").eq("token", claimToken).is("claimed_by", null).gt("expires_at", new Date().toISOString()).maybeSingle();

      if (error || !data) {
        setError("Invalid or expired claim token");
        return;
      }

      setTokenData(data);
    } catch (err) {
      console.error("Error verifying claim token:", err);
      setError("Failed to verify claim token");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user) {
      toast.error("Please sign in to claim this certificate");
      navigate(`/auth/login?redirect=/claim/${claimToken}`);
      return;
    }

    setClaiming(true);
    try {
      // Call edge function to process claim
      const { data, error } = await supabase.functions.invoke("claim-certificate", {
        body: { claimToken, userId: user.id }
      });

      if (error) throw error;

      // Check if token association is needed
      if (!data.success && data.needsAssociation) {
        setNeedsAssociation(true);
        setAssociationInstructions(data.associationInstructions);
        setTokenData({ ...tokenData, tokenId: data.tokenId });
        toast.error("Token association required. Please follow the instructions below.");
        return;
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to claim certificate');
      }

      toast.success("Certificate claimed successfully!");
      navigate(`/candidate/my-certificates/${data.certificateId}`);
    } catch (err: any) {
      console.error("Error claiming certificate:", err);
      toast.error(err.message || "Failed to claim certificate");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Claim Token</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Claim Your Certificate</h1>
          <p className="text-muted-foreground">
            You've been issued a certificate. Claim it to add it to your wallet.
          </p>
        </div>

        {tokenData && (
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Certificate ID</p>
              <p className="font-mono text-sm">{tokenData.certificate_id}</p>
            </div>

            {tokenData.tokenId && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Token ID</p>
                <p className="font-mono text-sm">{tokenData.tokenId}</p>
              </div>
            )}
          </div>
        )}

        {needsAssociation && associationInstructions && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Token Association Required</AlertTitle>
            <AlertDescription>
              <p className="mb-4">Before claiming this certificate, you must associate the token with your Hedera account:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>{associationInstructions.step1}</li>
                <li>{associationInstructions.step2}</li>
                <li>{associationInstructions.step3}</li>
                <li>{associationInstructions.step4}</li>
                <li>{associationInstructions.step5}</li>
              </ol>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.hashpack.app/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  HashPack Wallet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://www.bladewallet.io/', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Blade Wallet
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full"
          size="lg"
        >
          {claiming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Claiming...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Claim Certificate
            </>
          )}
        </Button>

        {!user && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            You'll need to sign in to claim this certificate
          </p>
        )}
      </Card>
    </div>
  );
};

export default Claim;
