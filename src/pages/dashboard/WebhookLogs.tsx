import { Webhook, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const WebhookLogs = () => {
  const webhookEvents = [
    {
      id: 1,
      event: "certificate.issued",
      url: "https://api.example.com/webhook",
      status: "success",
      timestamp: "2024-10-20 14:30:45",
      responseCode: 200,
      retries: 0
    },
    {
      id: 2,
      event: "certificate.claimed",
      url: "https://api.example.com/webhook",
      status: "success",
      timestamp: "2024-10-20 12:15:30",
      responseCode: 200,
      retries: 0
    },
    {
      id: 3,
      event: "certificate.revoked",
      url: "https://api.example.com/webhook",
      status: "failed",
      timestamp: "2024-10-19 16:45:20",
      responseCode: 500,
      retries: 3
    },
    {
      id: 4,
      event: "certificate.issued",
      url: "https://api.example.com/webhook",
      status: "pending",
      timestamp: "2024-10-19 09:30:15",
      responseCode: null,
      retries: 1
    }
  ];

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Webhook Logs</h1>
          <p className="text-muted-foreground">Monitor webhook event deliveries and responses</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhookEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {webhookEvents.filter(e => e.status === 'success').length}
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
              {webhookEvents.filter(e => e.status === 'failed').length}
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
              {webhookEvents.filter(e => e.status === 'pending').length}
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
