import { Clock, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const BatchHistory = () => {
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

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batch-history', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return [];
      
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('id, action, created_at, metadata, user_id')
        .eq('institution_id', profile.institution_id)
        .eq('action', 'batch_upload')
        .order('created_at', { ascending: false })
        .limit(50);
      
      return logs?.map(log => {
        const metadata = log.metadata as any || {};
        return {
          id: log.id,
          filename: metadata.filename || 'batch_upload.csv',
          uploadedAt: new Date(log.created_at || '').toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: metadata.status || 'completed',
          total: metadata.total || 0,
          successful: metadata.successful || 0,
          failed: metadata.failed || 0
        };
      }) || [];
    },
    enabled: !!profile?.institution_id
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "processing":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    totalBatches: batches?.length || 0,
    totalCertificates: batches?.reduce((sum, b) => sum + b.total, 0) || 0,
    successful: batches?.reduce((sum, b) => sum + b.successful, 0) || 0,
    failed: batches?.reduce((sum, b) => sum + b.failed, 0) || 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Batch Upload History</h1>
          <p className="text-muted-foreground">Track and manage batch certificate issuance</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          New Batch Upload
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBatches}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
          <CardDescription>Recent batch uploads and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading batch history...</div>
          ) : batches && batches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.filename}</TableCell>
                    <TableCell>{batch.uploadedAt}</TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                    <TableCell>{batch.total}</TableCell>
                    <TableCell className="text-green-600">{batch.successful}</TableCell>
                    <TableCell className="text-red-600">{batch.failed}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No batch uploads yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first CSV file to issue certificates in bulk
              </p>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Batch
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Batch Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Upload CSV files with recipient information (name, email, course details)</p>
          <p>• Maximum 1000 certificates per batch</p>
          <p>• All certificates in a batch will be minted to the Hedera network</p>
          <p>• Failed certificates can be retried individually</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchHistory;
