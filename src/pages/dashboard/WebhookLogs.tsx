import { Webhook, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const WebhookLogs = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user?.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  const { data: webhookConfig } = useQuery({
    queryKey: ['webhook-config', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return null;
      
      const { data } = await supabase
        .from('webhooks')
        .select('*')
        .eq('institution_id', profile.institution_id)
        .maybeSingle();
      
      return data;
    },
    enabled: !!profile?.institution_id
  });

  const { data: webhookEvents, isLoading, refetch } = useQuery({
    queryKey: ['webhook-logs', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return [];
      
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('id, action, created_at, metadata, target_id, target_type')
        .eq('institution_id', profile.institution_id)
        .in('action', ['webhook_sent', 'webhook_failed', 'webhook_retry'])
        .order('created_at', { ascending: false })
        .limit(100);
      
      return logs?.map(log => {
        const metadata = log.metadata as any || {};
        return {
          id: log.id,
          event: metadata.event_type || log.target_type || 'certificate.unknown',
          url: metadata.url || webhookConfig?.url || 'Not configured',
          status: log.action === 'webhook_sent' ? 'success' : 
                  log.action === 'webhook_failed' ? 'failed' : 'pending',
          timestamp: new Date(log.created_at || '').toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          responseCode: metadata.response_code || null,
          retries: metadata.retry_count || 0
        };
      }) || [];
    },
    enabled: !!profile?.institution_id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    total: webhookEvents?.length || 0,
    successful: webhookEvents?.filter(e => e.status === 'success').length || 0,
    failed: webhookEvents?.filter(e => e.status === 'failed').length || 0,
    pending: webhookEvents?.filter(e => e.status === 'pending').length || 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Webhook Logs</h1>
          <p className="text-muted-foreground">Monitor webhook event deliveries and responses</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {!webhookConfig && (
        <Card className="mb-6 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-600">No Webhook Configured</CardTitle>
            <CardDescription>
              Configure a webhook endpoint in Settings to receive real-time certificate events
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successful}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest webhook deliveries and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading webhook logs...</div>
          ) : webhookEvents && webhookEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium font-mono text-sm">{event.event}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {event.url}
                    </TableCell>
                    <TableCell>{getStatusBadge(event.status)}</TableCell>
                    <TableCell>
                      {event.responseCode ? (
                        <Badge variant="outline">{event.responseCode}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{event.retries}</TableCell>
                    <TableCell className="text-sm">{event.timestamp}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Webhook className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No webhook events yet</h3>
              <p className="text-muted-foreground mb-4">
                {webhookConfig 
                  ? 'Webhook events will appear here when certificate actions trigger notifications'
                  : 'Configure a webhook endpoint in Settings to start receiving events'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Webhook Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Webhooks are sent for certificate events (issued, claimed, revoked)</p>
          <p>• Failed deliveries are automatically retried up to 3 times</p>
          <p>• Configure webhook endpoints in Settings → Webhooks</p>
          <p>• All webhook payloads include a signature for verification</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookLogs;
