import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Shield, CheckCircle2, Calendar, User, Building, FileText, Download, Share2, ExternalLink, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicHeader } from "@/components/PublicHeader";
import { hederaService } from "@/lib/hedera";
import { ipfsService } from "@/lib/ipfs";
import { toast } from "sonner";
import { getHederaConfig } from "@/lib/hedera/config";

interface CertificateData {
  id: string;
  recipientName?: string;
  recipientDid?: string;
  courseName: string;
  institution: string;
  institutionDid?: string;
  issuedDate: string;
  expiresAt?: string | null;
  serialNumber: string;
  tokenId: string;
  ipfsCid: string;
  transactionId?: string;
  status: 'valid' | 'revoked' | 'invalid';
  skills?: string[];
  grade?: string;
}

const VerifyDetail = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Verify the certificate
        const result = await hederaService.verifyCertificate(certificateId);

        if (!result.verified) {
          setError(result.revokedAt ? 'Certificate has been revoked' : 'Certificate not found or invalid');
          setCertificate({
            id: certificateId,
            courseName: 'Unknown',
            institution: 'Unknown',
            issuedDate: '',
            serialNumber: certificateId,
            tokenId: '',
            ipfsCid: '',
            status: result.revokedAt ? 'revoked' : 'invalid'
          });
          return;
        }

        // Fetch metadata from IPFS if available
        let metadata = result.metadata;
        if (result.certificateId && !metadata) {
          try {
            const ipfsData = await ipfsService.fetchFromIPFS(result.certificateId);
            metadata = ipfsData as any;
          } catch (err) {
            console.warn('Failed to fetch IPFS metadata:', err);
          }
        }

        const config = getHederaConfig();
        const [tokenId, serialNumber] = certificateId.includes(':')
          ? certificateId.split(':')
          : [result.tokenId || '', String(result.serialNumber || '')];

        setCertificate({
          id: certificateId,
          recipientName: metadata?.recipientName,
          recipientDid: result.issuedTo,
          courseName: metadata?.courseName || 'Unknown Course',
          institution: metadata?.institutionName || 'Unknown Institution',
          institutionDid: result.issuedBy,
          issuedDate: result.issuedAt || new Date().toISOString(),
          expiresAt: metadata?.expiresAt,
          serialNumber: `${tokenId}:${serialNumber}`,
          tokenId: tokenId,
          ipfsCid: result.certificateId || '',
          transactionId: config.network === 'mainnet'
            ? `${tokenId}@${Date.now()}`
            : `${tokenId}@${Date.now()}`,
          status: result.revokedAt ? 'revoked' : 'valid',
          skills: metadata?.skills,
          grade: metadata?.grade
        });

      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch certificate details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleDownload = async () => {
    if (!certificate) return;
    
    try {
      toast.info("Generating PDF certificate...");
      
      // Production-ready PDF generation without external libraries
      // Using browser's print functionality for PDF export
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to download certificate");
        return;
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Certificate - ${certificate.courseName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Georgia', serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate {
              background: white;
              padding: 60px;
              max-width: 800px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              border: 15px solid #f8f9fa;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #667eea;
              padding-bottom: 30px;
              margin-bottom: 40px;
            }
            .logo { font-size: 2em; color: #667eea; font-weight: bold; }
            h1 { font-size: 2.5em; color: #333; margin: 20px 0 10px; }
            .subtitle { color: #666; font-size: 1.2em; }
            .content {
              text-align: center;
              margin: 40px 0;
              line-height: 2;
            }
            .recipient { font-size: 2em; font-weight: bold; color: #667eea; margin: 20px 0; }
            .course { font-size: 1.5em; color: #333; margin: 20px 0; }
            .details {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 2px solid #eee;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              text-align: left;
            }
            .detail-item {
              padding: 10px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .detail-label {
              font-size: 0.9em;
              color: #666;
              margin-bottom: 5px;
            }
            .detail-value {
              font-weight: bold;
              color: #333;
              word-break: break-all;
            }
            .blockchain {
              margin-top: 30px;
              padding: 20px;
              background: #e8eaf6;
              border-radius: 10px;
              text-align: center;
            }
            .blockchain h3 {
              color: #667eea;
              margin-bottom: 15px;
            }
            .verification {
              font-size: 0.9em;
              color: #666;
              font-family: monospace;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              text-align: center;
              color: #999;
              font-size: 0.9em;
            }
            @media print {
              body { background: white; padding: 0; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="logo">🛡️ CertChain</div>
              <h1>Certificate of Completion</h1>
              <p class="subtitle">Verified on Hedera Blockchain</p>
            </div>
            
            <div class="content">
              <p>This is to certify that</p>
              <div class="recipient">${certificate.recipientName || 'Certificate Holder'}</div>
              <p>has successfully completed</p>
              <div class="course">${certificate.courseName}</div>
              <p>Issued by ${certificate.institution}</p>
            </div>

            <div class="details">
              <div class="detail-item">
                <div class="detail-label">Issue Date</div>
                <div class="detail-value">${new Date(certificate.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Certificate ID</div>
                <div class="detail-value">${certificate.serialNumber}</div>
              </div>
              ${certificate.recipientDid ? `
              <div class="detail-item">
                <div class="detail-label">Recipient DID</div>
                <div class="detail-value">${certificate.recipientDid}</div>
              </div>` : ''}
              ${certificate.institutionDid ? `
              <div class="detail-item">
                <div class="detail-label">Issuer DID</div>
                <div class="detail-value">${certificate.institutionDid}</div>
              </div>` : ''}
            </div>

            <div class="blockchain">
              <h3>🔗 Blockchain Verification</h3>
              <div class="verification">
                <p><strong>Token ID:</strong> ${certificate.tokenId}</p>
                <p><strong>Transaction:</strong> ${certificate.transactionId || 'N/A'}</p>
                <p><strong>IPFS:</strong> ${certificate.ipfsCid}</p>
              </div>
              <p style="margin-top: 15px; font-size: 0.85em;">
                Verify at: ${window.location.origin}/verify/status/${certificate.id}
              </p>
            </div>

            <div class="footer">
              <p>This certificate is secured on the Hedera Hashgraph network</p>
              <p>Tamper-proof • Verifiable • Permanent</p>
            </div>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          toast.success("PDF ready! Use Print dialog to save as PDF");
        }, 500);
      };

      // NOTE: For advanced PDF generation with custom styling, QR codes, and watermarks:
      // Install jsPDF: npm install jspdf
      // Import: import jsPDF from 'jspdf';
      // Example implementation:
      // const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      // doc.setFont('helvetica', 'bold');
      // doc.text(certificate.courseName, 148, 50, { align: 'center' });
      // doc.save(`certificate-${certificate.id}.pdf`);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleShare = async () => {
    if (!certificate) return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${certificate.courseName} Certificate`,
          text: `Verify ${certificate.recipientName}'s certificate`,
          url: url
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
        }
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleViewIPFS = () => {
    if (!certificate?.ipfsCid) return;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${certificate.ipfsCid}`;
    window.open(gatewayUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying certificate...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="p-6 mb-8 gradient-card border-destructive/20 shadow-elevated">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Certificate Not Found</h1>
                <p className="text-muted-foreground">{error || 'Unable to verify this certificate'}</p>
              </div>
            </div>
          </Card>
          <div className="text-center">
            <Link to="/verify">
              <Button variant="outline">Back to Verify</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isValid = certificate.status === 'valid';
  const isRevoked = certificate.status === 'revoked';

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Status Banner */}
        <Card className={`p-6 mb-8 gradient-card shadow-elevated ${isValid ? 'border-primary/20' : 'border-destructive/20'
          }`}>
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${isValid ? 'bg-primary/10' : 'bg-destructive/10'
              }`}>
              {isValid ? (
                <CheckCircle2 className="h-8 w-8 text-primary" />
              ) : (
                <XCircle className="h-8 w-8 text-destructive" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {isValid ? 'Certificate Verified' : isRevoked ? 'Certificate Revoked' : 'Certificate Invalid'}
              </h1>
              <p className="text-muted-foreground">
                {isValid
                  ? 'This certificate is valid and has been verified on Hedera blockchain'
                  : isRevoked
                    ? 'This certificate has been revoked and is no longer valid'
                    : 'This certificate could not be verified'}
              </p>
            </div>
          </div>
        </Card>

        {/* Certificate Details */}
        <Card className="p-8 space-y-8 cert-shine">
          <div className="text-center border-b border-border/40 pb-6">
            <h2 className="text-3xl font-bold mb-2">{certificate.courseName}</h2>
            <p className="text-muted-foreground">Certificate of Completion</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Recipient</span>
              </div>
              <p className="font-medium text-lg">{certificate.recipientName || 'Not specified'}</p>
              {certificate.recipientDid && (
                <p className="text-sm font-mono text-muted-foreground">{certificate.recipientDid}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>Issued By</span>
              </div>
              <p className="font-medium text-lg">{certificate.institution}</p>
              {certificate.institutionDid && (
                <p className="text-sm font-mono text-muted-foreground">{certificate.institutionDid}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Issue Date</span>
              </div>
              <p className="font-medium">{new Date(certificate.issuedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Serial Number</span>
              </div>
              <p className="font-mono text-sm">{certificate.serialNumber}</p>
            </div>
          </div>

          {certificate.skills && certificate.skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Skills & Competencies</h3>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border/40 pt-6 space-y-4">
            <h3 className="font-semibold">Blockchain Verification</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Token ID</p>
                <p className="font-mono text-sm">{certificate.tokenId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                <p className="font-mono text-sm truncate">{certificate.transactionId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">IPFS CID</p>
                <p className="font-mono text-sm truncate">{certificate.ipfsCid}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isValid
                    ? 'bg-primary/10 text-primary'
                    : 'bg-destructive/10 text-destructive'
                  }`}>
                  {isValid ? 'Valid' : isRevoked ? 'Revoked' : 'Invalid'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="hero" className="flex-1" onClick={handleDownload} disabled={!isValid}>
              <Download className="h-4 w-4" />
              <span className="ml-2">Download Certificate</span>
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span className="ml-2">Share</span>
            </Button>
            {certificate.ipfsCid && (
              <Button variant="outline" onClick={handleViewIPFS}>
                <ExternalLink className="h-4 w-4" />
                <span className="ml-2">View on IPFS</span>
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyDetail;
