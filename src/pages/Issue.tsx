import { useState } from "react";
import { Shield, Award, User, Mail, Book, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { useActivityLog, ActivityActions } from "@/hooks/useActivityLog";
import { supabase } from "@/integrations/supabase/client";
import { hederaService } from "@/lib/hedera/service";

const IssueCertificate = () => {
  const navigate = useNavigate();
  const { dashboardPath, certificatesPath } = useRoleBasedNavigation();
  const { logActivity, logError } = useActivityLog();
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: "",
    description: "",
    skills: "",
    certificateImage: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData({ ...formData, certificateImage: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, certificateImage: null });
    setImagePreview(null);
  };

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
        imageUrl: null as string | null, // Will be set after upload
      };

      // Step 1: Upload certificate image to IPFS if provided
      if (formData.certificateImage) {
        toast.info("Uploading certificate image to IPFS...");

        // Convert File to base64
        const reader = new FileReader();
        const base64Content = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(formData.certificateImage!);
        });

        const imageUploadResponse = await hederaService.uploadToIPFS({
          type: 'file',
          fileData: {
            content: base64Content,
            filename: formData.certificateImage.name,
            mimetype: formData.certificateImage.type,
          },
        });

        certificateData.imageUrl = `https://gateway.pinata.cloud/ipfs/${imageUploadResponse.ipfsHash}`;
        toast.success("Image uploaded successfully!");
      }

      // Step 2: Upload metadata to IPFS via Pinata
      toast.info("Uploading certificate metadata to IPFS...");
      const pinataResponse = await hederaService.uploadToIPFS({
        type: 'metadata',
        certificateData,
      });

      const ipfsCid = pinataResponse.ipfsHash;
      toast.success(`Metadata uploaded to IPFS: ${ipfsCid}`);

      // Step 3: Mint NFT on Hedera
      toast.info("Minting certificate NFT on Hedera...");
      const mintResponse = await hederaService.mintCertificate({
        recipientAccountId: null, // Will be set when claimed
        institutionId: profile.institution_id, // For validation
        institutionTokenId: institution.collection_token_id,
        metadataCid: ipfsCid,
        certificateData,
        network: 'testnet', // Change to 'mainnet' for production
      });

      toast.success(`Certificate minted! Serial: ${mintResponse.serialNumber}`);

      // Step 4: Save to database
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
            imageUrl: certificateData.imageUrl,
          },
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Certificate minted but failed to save to database');
      }

      // Step 5: Create claim token
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

        // Step 5: Send email with claim link (optional feature - can be extended)
        // Note: send-invitation-email function is available but focused on invitations
        // For production, create a dedicated send-certificate-claim function or extend existing one
        toast.info("Share the claim link with the certificate recipient");

        console.log('Claim URL:', claimUrl);
      }

      // Step 6: Log to HCS for audit trail
      toast.info("Logging to Hedera Consensus Service...");
      try {
        await hederaService.logToHCS({
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
            hasImage: !!certificateData.imageUrl,
          },
          network: 'testnet',
        });
        toast.success("Event logged to HCS!");
      } catch (hcsError) {
        console.error('HCS logging failed:', hcsError);
        // Don't fail the issuance if HCS logging fails
      }

      // Step 7: Log activity for audit trail
      await logActivity({
        action: ActivityActions.CERTIFICATE_ISSUED,
        resourceType: 'certificate',
        resourceId: certificateId,
        metadata: {
          recipientEmail: formData.recipientEmail,
          recipientName: formData.recipientName,
          courseName: formData.courseName,
          tokenId: mintResponse.tokenId,
          serialNumber: mintResponse.serialNumber,
          institutionId: profile.institution_id,
        }
      });

      toast.success("Certificate issued successfully!");
      navigate(certificatesPath);

    } catch (error: any) {
      console.error('Error issuing certificate:', error);

      // Log error for troubleshooting
      await logError('certificate_issuance_failed', error, {
        recipientEmail: formData.recipientEmail,
        courseName: formData.courseName,
      });

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

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-primary" />
                Certificate Image (Optional)
              </label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Certificate preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="certificate-image"
                    />
                    <label htmlFor="certificate-image" className="cursor-pointer">
                      <ImagePlus className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload certificate image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </label>
                  </div>
                )}
              </div>
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
