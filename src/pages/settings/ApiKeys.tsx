import { useState } from "react";
import { Shield, Key, Plus, Copy, Eye, EyeOff, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  scopes: string[];
}

const ApiKeys = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["read:certificates"]);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      // TODO: Re-enable when api_keys table is created in Supabase
      // const { data, error } = await supabase
      //   .from('api_keys')
      //   .select('*')
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      // return data as ApiKey[];
      return [] as ApiKey[];
    }
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      // TODO: Re-enable when api_keys table is created in Supabase
      throw new Error('API Keys feature not yet available - please run database migration');
      
      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error('Not authenticated');

      // // Generate API key
      // const key = `ck_${crypto.randomUUID().replace(/-/g, '')}`;
      // const keyPrefix = key.substring(0, 12);

      // const { data, error } = await supabase
      //   .from('api_keys')
      //   .insert({
      //     user_id: user.id,
      //     name: keyName,
      //     key_hash: await hashKey(key),
      //     key_prefix: keyPrefix,
      //     scopes: selectedScopes,
      //     is_active: true,
      //   })
      //   .select()
      //   .single();

      // if (error) throw error;

      // return { apiKey: data, fullKey: key };
    },
    onSuccess: ({ fullKey }) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setNewApiKey(fullKey);
      setKeyName("");
      setSelectedScopes(["read:certificates"]);
      toast.success("API key created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create API key");
    }
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      // TODO: Re-enable when api_keys table is created in Supabase
      throw new Error('API Keys feature not yet available - please run database migration');
      
      // const { error } = await supabase
      //   .from('api_keys')
      //   .delete()
      //   .eq('id', keyId);

      // if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success("API key deleted");
      setDeleteKeyId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete API key");
    }
  });

  const hashKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const availableScopes = [
    { value: "read:certificates", label: "Read Certificates" },
    { value: "write:certificates", label: "Issue Certificates" },
    { value: "revoke:certificates", label: "Revoke Certificates" },
    { value: "read:analytics", label: "Read Analytics" },
    { value: "manage:webhooks", label: "Manage Webhooks" },
  ];

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
            <h1 className="text-3xl font-bold mb-2">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for programmatic access to CertChain
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Key
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">API Key Security</p>
                <p className="text-sm text-muted-foreground">
                  Store your API keys securely. They won't be displayed again after creation.
                  Use environment variables and never commit keys to version control.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Your API Keys
            </CardTitle>
            <CardDescription>
              {apiKeys?.length || 0} active API key{apiKeys?.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading API keys...</p>
            ) : apiKeys?.length === 0 ? (
              <div className="text-center py-12">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No API keys yet</p>
                <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                  Create Your First API Key
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Scopes</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys?.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {key.key_prefix}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.slice(0, 2).map((scope) => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope.split(':')[1]}
                            </Badge>
                          ))}
                          {key.scopes.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{key.scopes.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(key.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.last_used_at
                          ? new Date(key.last_used_at).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        {key.is_active ? (
                          <Badge className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteKeyId(key.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create API Key Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Give your API key a name and select the permissions it should have.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="Production API Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="space-y-2">
                  {availableScopes.map((scope) => (
                    <label key={scope.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScopes([...selectedScopes, scope.value]);
                          } else {
                            setSelectedScopes(selectedScopes.filter(s => s !== scope.value));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createKeyMutation.mutate()}
                disabled={!keyName || selectedScopes.length === 0 || createKeyMutation.isPending}
              >
                Create Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Show New Key Dialog */}
        <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                API Key Created
              </DialogTitle>
              <DialogDescription>
                Copy this key now. You won't be able to see it again!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Your API Key</Label>
                <div className="flex gap-2">
                  <Input value={newApiKey || ''} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(newApiKey || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Store this key securely. It won't be shown again.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setNewApiKey(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Any applications using this key will immediately
                lose access.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteKeyId && deleteKeyMutation.mutate(deleteKeyId)}
                className="bg-destructive text-destructive-foreground"
              >
                Delete Key
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ApiKeys;
