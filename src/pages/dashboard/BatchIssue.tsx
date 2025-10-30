import { Shield, Upload, FileText, AlertCircle, CheckCircle2, X, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hederaService } from "@/lib/hedera/service";

interface CertificateRow {
  recipientName: string;
  recipientEmail: string;
  recipientDid: string;
  certificateType: string;
  issueDate: string;
  metadata?: string;
}

interface BatchResult {
  success: boolean;
  row: number;
  recipientName: string;
  message: string;
  certificateId?: string;
}

const BatchIssue = () => {
  const { dashboardPath } = useRoleBasedNavigation();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CertificateRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(selectedFile);

    // Parse CSV
    const text = await selectedFile.text();
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      toast.error("CSV file is empty or invalid");
      return;
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['recipientName', 'recipientEmail', 'recipientDid', 'certificateType', 'issueDate'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
      return;
    }

    // Parse rows
    const data: CertificateRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < requiredHeaders.length) continue;

      const row: CertificateRow = {
        recipientName: values[headers.indexOf('recipientName')],
        recipientEmail: values[headers.indexOf('recipientEmail')],
        recipientDid: values[headers.indexOf('recipientDid')],
        certificateType: values[headers.indexOf('certificateType')],
        issueDate: values[headers.indexOf('issueDate')],
        metadata: headers.includes('metadata') ? values[headers.indexOf('metadata')] : undefined
      };

      data.push(row);
    }

    setCsvData(data);
    toast.success(`Loaded ${data.length} certificates from CSV`);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const processBatch = async () => {
    if (csvData.length === 0) {
      toast.error("No data to process");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const batchResults: BatchResult[] = [];

    // Get user's institution
    const { data: profile } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', user?.id)
      .single();

    if (!profile?.institution_id) {
      toast.error("No institution found");
      setIsProcessing(false);
      return;
    }

    // Process each certificate
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        // 1. Upload metadata to IPFS
        const metadata = {
          name: `Certificate - ${row.certificateType}`,
          description: `Certificate awarded to ${row.recipientName}`,
          type: row.certificateType,
          recipientName: row.recipientName,
          recipientEmail: row.recipientEmail,
          recipientDid: row.recipientDid,
          issueDate: row.issueDate,
          customMetadata: row.metadata ? JSON.parse(row.metadata) : {}
        };

        const ipfsData = await hederaService.uploadToIPFS({ metadata } as any);

        // 2. Mint certificate NFT
        const mintData = await hederaService.mintCertificate({
          action: 'mint',
          institution_id: profile.institution_id,
          recipient_did: row.recipientDid,
          metadata_uri: ipfsData.uri,
          metadata: metadata
        } as any);

        // 3. Save to database
        const { error: dbError } = await supabase
          .from('certificates')
          .insert({
            institution_id: profile.institution_id,
            recipient_did: row.recipientDid,
            recipient_name: row.recipientName,
            recipient_email: row.recipientEmail,
            metadata_uri: ipfsData.uri,
            serial_number: mintData.serialNumber,
            token_id: mintData.tokenId,
            type: row.certificateType,
            issue_date: row.issueDate,
            status: 'issued'
          });

        if (dbError) throw new Error(`Database save failed: ${dbError.message}`);

        // 4. Log to HCS for audit trail (non-blocking)
        try {
          await hederaService.logToHCS({
            topicId: '0.0.7115183',
            messageType: 'certificate_issued',
            message: {
              certificateId: mintData.serialNumber,
              tokenId: mintData.tokenId,
              serialNumber: mintData.serialNumber,
              institutionId: profile.institution_id,
              recipientEmail: row.recipientEmail,
              recipientName: row.recipientName,
              certificateType: row.certificateType,
              issuedAt: row.issueDate,
            },
            network: 'testnet',
          });
        } catch (hcsError) {
          console.error('HCS logging failed for batch certificate:', hcsError);
          // Don't fail the issuance if HCS logging fails
        }

        batchResults.push({
          success: true,
          row: i + 1,
          recipientName: row.recipientName,
          message: `Certificate issued successfully`,
          certificateId: mintData.serialNumber
        });

      } catch (error: any) {
        batchResults.push({
          success: false,
          row: i + 1,
          recipientName: row.recipientName,
          message: error.message || 'Unknown error'
        });
      }

      setProgress(((i + 1) / csvData.length) * 100);
    }

    setResults(batchResults);
    setIsProcessing(false);

    const successCount = batchResults.filter(r => r.success).length;
    const failCount = batchResults.filter(r => !r.success).length;

    toast.success(`Batch complete: ${successCount} succeeded, ${failCount} failed`);
  };

  const downloadSampleCSV = () => {
    const sample = `recipientName,recipientEmail,recipientDid,certificateType,issueDate,metadata\nJohn Doe,john@example.com,did:hedera:testnet:123,Achievement,2024-01-15,{}\nJane Smith,jane@example.com,did:hedera:testnet:456,Completion,2024-01-16,{}`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-certificates.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setCsvData([]);
    setResults([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={dashboardPath} className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CertChain</span>
          </Link>
          <div className="flex gap-2">
            <Button onClick={downloadSampleCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Sample CSV
            </Button>
            <Link to={dashboardPath}><Button variant="ghost" size="sm">Back</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Batch Issue Certificates</h1>
          <p className="text-muted-foreground">Upload a CSV file to issue multiple certificates at once</p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Required CSV columns: recipientName, recipientEmail, recipientDid, certificateType, issueDate.
            Optional: metadata (JSON string)
          </AlertDescription>
        </Alert>

        {/* Upload Section */}
        {!file && (
          <Card
            className={`p-12 text-center border-2 border-dashed transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`h-16 w-16 mx-auto mb-4 transition-colors ${dragActive ? 'text-primary' : 'text-muted-foreground'
              }`} />
            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop or click to browse
            </p>
            <input
              type="file"
              id="csv-upload"
              className="hidden"
              accept=".csv"
              onChange={handleFileInputChange}
            />
            <label htmlFor="csv-upload">
              <Button variant="hero" asChild>
                <span>Select File</span>
              </Button>
            </label>
          </Card>
        )}

        {/* File Preview */}
        {file && csvData.length > 0 && !isProcessing && results.length === 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>{file.name}</CardTitle>
                    <CardDescription>{csvData.length} certificates ready to process</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={reset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview first 5 rows */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Recipient</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{row.recipientName}</td>
                          <td className="px-4 py-2">{row.recipientEmail}</td>
                          <td className="px-4 py-2">{row.certificateType}</td>
                          <td className="px-4 py-2">{row.issueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 5 && (
                    <div className="px-4 py-2 bg-muted/50 text-xs text-center">
                      +{csvData.length - 5} more rows
                    </div>
                  )}
                </div>

                <Button onClick={processBatch} className="w-full" size="lg">
                  Process {csvData.length} Certificates
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Section */}
        {isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Batch
              </CardTitle>
              <CardDescription>
                Issuing certificates... This may take a few minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
              <p className="text-sm text-muted-foreground">
                Processing {Math.ceil((progress / 100) * csvData.length)} of {csvData.length} certificates
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Batch Results</CardTitle>
                  <CardDescription>
                    {results.filter(r => r.success).length} succeeded, {results.filter(r => !r.success).length} failed
                  </CardDescription>
                </div>
                <Button onClick={reset}>Start New Batch</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border ${result.success ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-medium">Row {result.row}: {result.recipientName}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BatchIssue;


  const downloadSampleCSV = () => {
    const sample = `recipientName,recipientEmail,recipientDid,certificateType,issueDate,metadata
John Doe,john@example.com,did:hedera:testnet:123,Achievement,2024-01-15,{}
Jane Smith,jane@example.com,did:hedera:testnet:456,Completion,2024-01-16,{}`;

    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-certificates.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setCsvData([]);
    setResults([]);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={dashboardPath} className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CertChain</span>
          </Link>
          <div className="flex gap-2">
            <Button onClick={downloadSampleCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Sample CSV
            </Button>
            <Link to={dashboardPath}><Button variant="ghost" size="sm">Back</Button></Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Batch Issue Certificates</h1>
          <p className="text-muted-foreground">Upload a CSV file to issue multiple certificates at once</p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Required CSV columns: recipientName, recipientEmail, recipientDid, certificateType, issueDate.
            Optional: metadata (JSON string)
          </AlertDescription>
        </Alert>

        {/* Upload Section */}
        {!file && (
          <Card
            className={`p-12 text-center border-2 border-dashed transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className={`h-16 w-16 mx-auto mb-4 transition-colors ${dragActive ? 'text-primary' : 'text-muted-foreground'
              }`} />
            <h3 className="text-lg font-semibold mb-2">
              {dragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop or click to browse
            </p>
            <input
              type="file"
              id="csv-upload"
              className="hidden"
              accept=".csv"
              onChange={handleFileInputChange}
            />
            <label htmlFor="csv-upload">
              <Button variant="hero" asChild>
                <span>Select File</span>
              </Button>
            </label>
          </Card>
        )}

        {/* File Preview */}
        {file && csvData.length > 0 && !isProcessing && results.length === 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>{file.name}</CardTitle>
                    <CardDescription>{csvData.length} certificates ready to process</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={reset}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview first 5 rows */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left">Recipient</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-2">{row.recipientName}</td>
                          <td className="px-4 py-2">{row.recipientEmail}</td>
                          <td className="px-4 py-2">{row.certificateType}</td>
                          <td className="px-4 py-2">{row.issueDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 5 && (
                    <div className="px-4 py-2 bg-muted/50 text-xs text-center">
                      +{csvData.length - 5} more rows
                    </div>
                  )}
                </div>

                <Button onClick={processBatch} className="w-full" size="lg">
                  Process {csvData.length} Certificates
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Section */}
        {isProcessing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Batch
              </CardTitle>
              <CardDescription>
                Issuing certificates... This may take a few minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
              <p className="text-sm text-muted-foreground">
                Processing {Math.ceil((progress / 100) * csvData.length)} of {csvData.length} certificates
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Batch Results</CardTitle>
                  <CardDescription>
                    {results.filter(r => r.success).length} succeeded, {results.filter(r => !r.success).length} failed
                  </CardDescription>
                </div>
                <Button onClick={reset}>Start New Batch</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg border ${result.success ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-medium">Row {result.row}: {result.recipientName}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BatchIssue;
