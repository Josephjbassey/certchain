import { useState } from "react";
import { Shield, Award, User, Mail, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { supabase } from "@/integrations/supabase/client";

const IssueCertificate = () => {
  const navigate = useNavigate();
  const { dashboardPath, certificatesPath } = useRoleBasedNavigation();
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: "",
    description: "",
    skills: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current user and their institution
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single();

      if (!profile?.institution_id) throw new Error('Institution not found');

      const { data: institution } = await supabase
        .from('institutions')
        .select('name, did, collection_token_id')
        .eq('id', profile.institution_id)
        .single();

      if (!institution) throw new Error('Institution details not found');

      // Generate certificate ID
      const certificateId = crypto.randomUUID();

      // Prepare certificate metadata
      const certificateData = {
        certificateId,
        institutionId: profile.institution_id,
        institutionName: institution.name,
        issuerDid: institution.did,
        recipientEmail: formData.recipientEmail,
        recipientName: formData.recipientName,
        courseName: formData.courseName,
        description: formData.description,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        issuedAt: new Date().toISOString(),
        expiresAt: null, // Set expiry if needed
      };

      // Step 1: Upload metadata to IPFS via Pinata
      toast.info("Uploading certificate metadata to IPFS...");
      const { data: pinataResponse, error: pinataError } = await supabase.functions.invoke(
        'pinata-upload',
        {
          body: {
            type: 'metadata',
            certificateData,
          }
        }
      );

      if (pinataError || !pinataResponse?.IpfsHash) {
        throw new Error(pinataError?.message || 'Failed to upload to IPFS');
      }

      const ipfsCid = pinataResponse.IpfsHash;
      toast.success(`Metadata uploaded to IPFS: ${ipfsCid}`);

      // Step 2: Mint NFT on Hedera
      toast.info("Minting certificate NFT on Hedera...");
      const { data: mintResponse, error: mintError } = await supabase.functions.invoke(
        'hedera-mint-certificate',
        {
          body: {
            recipientAccountId: null, // Will be set when claimed
            institutionId: profile.institution_id, // For validation
            institutionTokenId: institution.collection_token_id,
            metadataCid: ipfsCid,
            certificateData,
            network: 'testnet', // Change to 'mainnet' for production
          }
        }
      );

      if (mintError || !mintResponse?.success) {
        throw new Error(mintError?.message || mintResponse?.error || 'Failed to mint certificate');
      }

      toast.success(`Certificate minted! Serial: ${mintResponse.serialNumber}`);

      // Step 3: Save to database
      const { error: dbError } = await supabase
        .from('certificate_cache')
        .insert({
          certificate_id: certificateId,
          institution_id: profile.institution_id,
          issued_by_user_id: user.id,
          issuer_did: institution.did,
          recipient_email: formData.recipientEmail,
          recipient_did: null, // Will be set when claimed
          course_name: formData.courseName,
          token_id: mintResponse.tokenId,
          serial_number: mintResponse.serialNumber,
          hedera_tx_id: mintResponse.transactionId,
          ipfs_cid: ipfsCid,
          issued_at: new Date().toISOString(),
          metadata: {
            description: formData.description,
            skills: certificateData.skills,
            recipient_name: formData.recipientName,
          },
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Certificate minted but failed to save to database');
      }

      // Step 4: Create claim token
      toast.info("Generating claim link...");
      const claimToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Expires in 30 days

      const { error: claimError } = await supabase
        .from('claim_tokens')
        .insert({
          token: claimToken,
          certificate_id: certificateId,
          expires_at: expiresAt.toISOString(),
        });

      if (claimError) {
        console.error('Failed to create claim token:', claimError);
        toast.error('Certificate issued but failed to generate claim link');
      } else {
        const claimUrl = `${window.location.origin}/claim/${claimToken}`;

        // Copy claim link to clipboard
        try {
          await navigator.clipboard.writeText(claimUrl);
          toast.success("Claim link copied to clipboard!");
        } catch (e) {
          console.error('Failed to copy to clipboard:', e);
        }

        // Step 5: Send email with claim link (optional - requires send-invitation-email function)
        // TODO: Update send-invitation-email function to handle certificate claims
        toast.info("Email notification not yet implemented. Share the claim link manually.");

        console.log('Claim URL:', claimUrl);
      }

      // Step 6: Log to HCS for audit trail
      toast.info("Logging to Hedera Consensus Service...");
      try {
        await supabase.functions.invoke('hedera-hcs-log', {
          body: {
            topicId: '0.0.7115183', // Your HCS topic
            messageType: 'certificate_issued',
            message: {
              certificateId,
              tokenId: mintResponse.tokenId,
              serialNumber: mintResponse.serialNumber,
              institutionId: profile.institution_id,
              recipientEmail: formData.recipientEmail,
              courseName: formData.courseName,
              issuedAt: new Date().toISOString(),
            },
            network: 'testnet',
          }
        });
        toast.success("Event logged to HCS!");
      } catch (hcsError) {
        console.error('HCS logging failed:', hcsError);
        // Don't fail the issuance if HCS logging fails
      }

      toast.success("Certificate issued successfully!");
      navigate(certificatesPath);

    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      toast.error(error.message || 'Failed to issue certificate');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={dashboardPath} className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
          <Link to={dashboardPath}>
            <Button variant="ghost" size="sm">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Issue New Certificate</h1>
          <p className="text-muted-foreground">Create and mint a new certificate NFT on Hedera</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Recipient Name
              </label>
              <Input
                placeholder="John Doe"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Recipient Email
              </label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                We'll send a claim link to this email
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Book className="h-4 w-4 text-primary" />
                Course/Program Name
              </label>
              <Input
                placeholder="Advanced Blockchain Development"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Description
              </label>
              <Textarea
                placeholder="Brief description of the course or achievement..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Skills (comma-separated)</label>
              <Input
                placeholder="Smart Contracts, Hedera SDK, DApp Development"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="border-t border-border/40 pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Certificate will be minted as NFT</span>
                <span className="text-muted-foreground">~$0.05 transaction fee</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Metadata stored on IPFS</span>
                <span className="text-muted-foreground">Permanent & decentralized</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={isLoading}>
                {isLoading ? "Issuing Certificate..." : "Issue Certificate"}
              </Button>
              <Link to={dashboardPath} className="flex-1">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        <Card className="p-6 mt-6 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Once issued, the certificate will be sent to the recipient's email
            with a secure claim link. They can claim it to their Hedera wallet or view it as a verifiable credential.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default IssueCertificate;
