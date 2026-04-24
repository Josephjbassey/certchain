import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, CheckCircle, Award, Loader2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const Institution = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [treasuryAccountId, setTreasuryAccountId] = useState("");
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      // @ts-ignore
      const { data } = await supabase.from('profiles')
        .select('*, institutions(*)')
        .eq('id', user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user
  });

  const institution = profile && typeof profile === 'object' && 'institutions' in profile ? (profile as any).institutions : null;

  // Update treasury account mutation
  const updateTreasuryAccount = useMutation({
    mutationFn: async (accountId: string) => {
      if (!institution?.id) throw new Error("No institution found");

      const { error } = await supabase
        .from('institutions')
        .update({ treasury_account_id: accountId })
        .eq('id', institution.id);

      if (error) throw error;
      return accountId;
    },
    onSuccess: () => {
      toast.success("Treasury account configured successfully");
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsConfigDialogOpen(false);
      setTreasuryAccountId("");
    },
    onError: (error: any) => {
      toast.error(`Failed to update treasury account: ${error.message}`);
    }
  });

  // Create NFT collection
  const createCollection = useMutation({
    mutationFn: async () => {
      if (!institution?.id) throw new Error("No institution found");
      if (!institution?.treasury_account_id) {
        throw new Error("Treasury account must be configured first");
      }

      const { data, error } = await supabase.functions.invoke('hedera-mint-certificate', {
        body: {
          action: 'create_collection',
          institution_id: institution.id,
          collection_name: `${institution.name} Certificates`,
          collection_symbol: institution.name.substring(0, 3).toUpperCase() + 'CERT'
        }
      });

      if (error) throw error;
      if (!data?.tokenId) throw new Error("No token ID returned");

      // Update institution with new token ID
      const { error: updateError } = await supabase
        .from('institutions')
        .update({ collection_token_id: data.tokenId })
        .eq('id', institution.id);

      if (updateError) throw updateError;

      return data.tokenId;
    },
    onSuccess: (tokenId) => {
      toast.success(`NFT Collection created: ${tokenId}`);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create collection: ${error.message}`);
    }
  });

  // Create HCS topic
  const createTopic = useMutation({
    mutationFn: async () => {
      if (!institution?.id) throw new Error("No institution found");

      const { data, error } = await supabase.functions.invoke('hedera-hcs-log', {
        body: {
          action: 'create_topic',
          institution_id: institution.id,
          topic_memo: `Audit log for ${institution.name}`
        }
      });

      if (error) throw error;
      if (!data?.topicId) throw new Error("No topic ID returned");

      // Update institution with new topic ID
      const { error: updateError } = await supabase
        .from('institutions')
        .update({ hcs_topic_id: data.topicId })
        .eq('id', institution.id);

      if (updateError) throw updateError;

      return data.topicId;
    },
    onSuccess: (topicId) => {
      toast.success(`HCS Topic created: ${topicId}`);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create topic: ${error.message}`);
    }
  });

  const handleSaveTreasuryAccount = () => {
    if (!treasuryAccountId.match(/^\d+\.\d+\.\d+$/)) {
      toast.error("Invalid account ID format. Use format: 0.0.123456");
      return;
    }
    updateTreasuryAccount.mutate(treasuryAccountId);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Institution Settings</h1>
        <p className="text-muted-foreground">Configure your institution profile and credentials</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Institution Profile</CardTitle>
                  <CardDescription>Basic information about your institution</CardDescription>
                </div>
              </div>
              {institution?.verified && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institution Name</Label>
              <Input id="name" value={institution?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" value={institution?.domain || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="did">DID</Label>
              <Input id="did" value={institution?.did || ''} disabled className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Hedera Configuration</CardTitle>
                <CardDescription>Blockchain and token settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">Treasury Account ID</Label>
              <div className="flex gap-2">
                <Input
                  id="account"
                  value={institution?.treasury_account_id || 'Not configured'}
                  disabled
                  className="font-mono"
                />
                {institution?.treasury_account_id && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(institution.treasury_account_id, 'treasury')}
                  >
                    {copiedField === 'treasury' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Collection Token ID</Label>
              <div className="flex gap-2">
                <Input
                  id="token"
                  value={institution?.collection_token_id || 'Not created'}
                  disabled
                  className="font-mono"
                />
                {institution?.collection_token_id && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(institution.collection_token_id, 'token')}
                  >
                    {copiedField === 'token' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {institution?.treasury_account_id && !institution?.collection_token_id && (
                <Button
                  onClick={() => {
                    setIsCreatingCollection(true);
                    createCollection.mutate();
                  }}
                  disabled={createCollection.isPending || isCreatingCollection}
                  className="w-full"
                >
                  {(createCollection.isPending || isCreatingCollection) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Collection...
                    </>
                  ) : (
                    "Create NFT Collection"
                  )}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">HCS Topic ID</Label>
              <div className="flex gap-2">
                <Input
                  id="topic"
                  value={institution?.hcs_topic_id || 'Not configured'}
                  disabled
                  className="font-mono"
                />
                {institution?.hcs_topic_id && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(institution.hcs_topic_id, 'topic')}
                  >
                    {copiedField === 'topic' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              {institution?.treasury_account_id && !institution?.hcs_topic_id && (
                <Button
                  onClick={() => {
                    setIsCreatingTopic(true);
                    createTopic.mutate();
                  }}
                  disabled={createTopic.isPending || isCreatingTopic}
                  variant="outline"
                  className="w-full"
                >
                  {(createTopic.isPending || isCreatingTopic) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Topic...
                    </>
                  ) : (
                    "Create HCS Topic"
                  )}
                </Button>
              )}
            </div>

            {!institution?.treasury_account_id && (
              <Button
                variant="default"
                onClick={() => setIsConfigDialogOpen(true)}
                className="w-full"
              >
                Configure Hedera Settings
              </Button>
            )}

            {institution?.treasury_account_id && institution?.collection_token_id && institution?.hcs_topic_id && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  All Hedera services configured and ready
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Treasury Account Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Treasury Account</DialogTitle>
            <DialogDescription>
              Enter your Hedera treasury account ID. This account will be used to mint and manage certificates.
              Format: 0.0.123456
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="treasury-input">Treasury Account ID</Label>
              <Input
                id="treasury-input"
                placeholder="0.0.123456"
                value={treasuryAccountId}
                onChange={(e) => setTreasuryAccountId(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                This should be a Hedera account ID that you control with the private key
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfigDialogOpen(false);
                setTreasuryAccountId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTreasuryAccount}
              disabled={updateTreasuryAccount.isPending || !treasuryAccountId}
            >
              {updateTreasuryAccount.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Institution;
