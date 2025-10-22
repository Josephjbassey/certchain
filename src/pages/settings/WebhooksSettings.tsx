import { useState } from "react";
import {
  Shield,
  Webhook,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Copy,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: string;
  institution_id: string;
}

const WebhooksSettings = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["certificate.issued"]);
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's profile to find institution_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single();

      if (!profile?.institution_id) return [];

      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('institution_id', profile.institution_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as WebhookConfig[];
    }
  });

  const createWebhookMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's profile to find institution_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single();

      if (!profile?.institution_id) throw new Error('Institution ID not found');

      // Generate webhook secret
      const secret = `whsec_${crypto.randomUUID().replace(/-/g, '')}`;

      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          institution_id: profile.institution_id,
          url: webhookUrl,
          events: selectedEvents,
          secret,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowCreateDialog(false);
      setWebhookUrl("");
      setSelectedEvents(["certificate.issued"]);
      toast.success("Webhook created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create webhook");
    }
  });

  const toggleWebhookMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('webhooks')
        .update({ active: !isActive })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success("Webhook updated");
    }
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: async (webhookId: string) => {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success("Webhook deleted");
      setDeleteWebhookId(null);
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const availableEvents = [
    { value: "certificate.issued", label: "Certificate Issued", description: "When a new certificate is issued" },
    { value: "certificate.claimed", label: "Certificate Claimed", description: "When a certificate is claimed by recipient" },
    { value: "certificate.revoked", label: "Certificate Revoked", description: "When a certificate is revoked" },
    { value: "certificate.verified", label: "Certificate Verified", description: "When a certificate is verified" },
    { value: "hcs.message", label: "HCS Message", description: "When a new HCS message is received" },
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
            <h1 className="text-3xl font-bold mb-2">Webhooks</h1>
            <p className="text-muted-foreground">
              Receive real-time notifications about events in your account
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Webhook
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Webhook Security</p>
                  <p className="text-sm text-muted-foreground">
                    All webhook requests are signed with HMAC-SHA256. Verify the signature using your webhook secret.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Retry Policy</p>
                  <p className="text-sm text-muted-foreground">
                    Failed webhooks are retried up to 3 times with exponential backoff.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Webhooks List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Your Webhooks
            </CardTitle>
            <CardDescription>
              {webhooks?.length || 0} webhook{webhooks?.length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading webhooks...</p>
            ) : webhooks?.length === 0 ? (
              <div className="text-center py-12">
                <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No webhooks configured yet</p>
                <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                  Create Your First Webhook
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {webhooks?.map((webhook) => (
                  <Card key={webhook.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-muted px-3 py-1 rounded">
                              {webhook.url}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => window.open(webhook.url, '_blank')}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            {webhook.active ? (
                              <Badge className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Created {new Date(webhook.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleWebhookMutation.mutate({ id: webhook.id, isActive: webhook.active })}
                          >
                            {webhook.active ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSecret(webhook.secret)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteWebhookId(webhook.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Webhook Logs Link */}
        <div className="mt-6 text-center">
          <Link to="/dashboard/webhooks/logs">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Webhook Logs
            </Button>
          </Link>
        </div>

        {/* Create Webhook Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive real-time event notifications.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-domain.com/webhooks/certchain"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  The endpoint must accept POST requests and return 2xx status codes
                </p>
              </div>
              <div className="space-y-3">
                <Label>Events to Subscribe</Label>
                {availableEvents.map((event) => (
                  <label key={event.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={selectedEvents.includes(event.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEvents([...selectedEvents, event.value]);
                        } else {
                          setSelectedEvents(selectedEvents.filter(e => e !== event.value));
                        }
                      }}
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{event.label}</p>
                      <p className="text-xs text-muted-foreground">{event.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createWebhookMutation.mutate()}
                disabled={!webhookUrl || selectedEvents.length === 0 || createWebhookMutation.isPending}
              >
                Create Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Show Secret Dialog */}
        <Dialog open={!!showSecret} onOpenChange={() => setShowSecret(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Webhook Secret</DialogTitle>
              <DialogDescription>
                Use this secret to verify webhook signatures
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Input value={showSecret || ''} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(showSecret || '')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-mono text-muted-foreground">
                  {`// Verify webhook signature\nconst signature = request.headers['x-certchain-signature'];\nconst isValid = crypto\n  .createHmac('sha256', webhookSecret)\n  .update(JSON.stringify(request.body))\n  .digest('hex') === signature;`}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowSecret(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteWebhookId} onOpenChange={() => setDeleteWebhookId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. You will stop receiving events at this endpoint.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteWebhookId && deleteWebhookMutation.mutate(deleteWebhookId)}
                className="bg-destructive text-destructive-foreground"
              >
                Delete Webhook
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default WebhooksSettings;
