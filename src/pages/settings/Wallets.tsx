import { useState } from "react";
import { Shield, Wallet, Plus, CheckCircle2, XCircle, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHederaWallet } from "@/contexts/HederaWalletContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { getExplorerUrl } from "@/lib/hedera";

interface ConnectedWallet {
  id: string;
  account_id: string;
  wallet_type: string;
  is_primary: boolean;
  connected_at: string;
  last_used_at?: string;
}

const Wallets = () => {
  const [disconnectWalletId, setDisconnectWalletId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { connect, accountId: connectedAccountId, isConnected: walletConnected } = useHederaWallet();

  const { data: wallets, isLoading } = useQuery({
    queryKey: ['connected-wallets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      return data as ConnectedWallet[];
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: async (walletId: string) => {
      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('id', walletId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-wallets'] });
      toast.success("Wallet disconnected");
      setDisconnectWalletId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to disconnect wallet");
    }
  });

  const setPrimaryMutation = useMutation({
    mutationFn: async (walletId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, unset all primary wallets
      await supabase
        .from('user_wallets')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected wallet as primary
      const { error } = await supabase
        .from('user_wallets')
        .update({ is_primary: true })
        .eq('id', walletId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connected-wallets'] });
      toast.success("Primary wallet updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to set primary wallet");
    }
  });

  const handleConnectWallet = async () => {
    try {
      toast.info("Opening wallet connection modal...");

      // Use the DAppConnector to open the modal
      await connect();

      // After connection, save wallet to database
      if (connectedAccountId && walletConnected) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('user_wallets')
            .insert({
              user_id: user.id,
              account_id: connectedAccountId,
              wallet_type: 'hedera', // Generic type since DAppConnector supports multiple wallets
              is_primary: wallets?.length === 0
            });

          if (error) {
            if (error.code === '23505') {
              toast.error("This wallet is already connected");
              return;
            }
            throw error;
          }

          queryClient.invalidateQueries({ queryKey: ['connected-wallets'] });
          toast.success(`Wallet connected: ${connectedAccountId}`);
        }
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);

      let errorMessage = error.message || "Please try again";

      if (error.message?.includes("User rejected") || error.message?.includes("user rejected")) {
        errorMessage = "Connection cancelled by user";
      } else if (error.message?.includes("already connected")) {
        errorMessage = "Wallet is already connected";
      }

      toast.error("Failed to connect wallet", {
        description: errorMessage
      });
    }
  };

  const getWalletIcon = (walletType: string) => {
    switch (walletType.toLowerCase()) {
      case 'hashpack':
        return '🔷';
      case 'blade':
        return '⚔️';
      case 'kabila':
        return '🌟';
      default:
        return '💼';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CertChain</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Connected Wallets</h1>
            <p className="text-muted-foreground">
              Manage your Hedera wallet connections
            </p>
          </div>
          <Button onClick={handleConnectWallet} className="gap-2">
            <Plus className="h-4 w-4" />
            Connect Wallet
          </Button>
        </div>

        {/* Supported Wallets Info */}
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">Supported Hedera Wallets</p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="gap-2 px-3 py-1">
                  🔷 HashPack
                </Badge>
                <Badge variant="secondary" className="gap-2 px-3 py-1">
                  ⚔️ Blade Wallet
                </Badge>
                <Badge variant="secondary" className="gap-2 px-3 py-1">
                  🌟 Kabila Wallet
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Wallets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your Wallets
            </CardTitle>
            <CardDescription>
              {wallets?.length || 0} wallet{wallets?.length !== 1 ? 's' : ''} connected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading wallets...</p>
            ) : wallets?.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No wallets connected yet</p>
                <Button onClick={handleConnectWallet} variant="outline">
                  Connect Your First Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {wallets?.map((wallet) => (
                  <Card key={wallet.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="text-4xl">{getWalletIcon(wallet.wallet_type)}</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg capitalize">
                              {wallet.wallet_type}
                            </h3>
                            {wallet.is_primary && (
                              <Badge className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <code className="text-sm bg-muted px-3 py-1 rounded">
                                {wallet.account_id}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => window.open(getExplorerUrl('account', wallet.account_id, 'testnet'), '_blank')}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Connected {new Date(wallet.connected_at).toLocaleDateString()}
                              {wallet.last_used_at && (
                                <> • Last used {new Date(wallet.last_used_at).toLocaleDateString()}</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!wallet.is_primary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrimaryMutation.mutate(wallet.id)}
                          >
                            Set as Primary
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDisconnectWalletId(wallet.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disconnect Confirmation Dialog */}
        <AlertDialog open={!!disconnectWalletId} onOpenChange={() => setDisconnectWalletId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect Wallet?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the wallet from your account. You can reconnect it anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => disconnectWalletId && disconnectMutation.mutate(disconnectWalletId)}
                className="bg-destructive text-destructive-foreground"
              >
                Disconnect
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Wallets;
