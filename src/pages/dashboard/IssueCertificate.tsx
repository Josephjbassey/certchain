import { useState } from "react";
import { Shield, Award, User, Mail, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const IssueCertificate = () => {
  const navigate = useNavigate();
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
    
    // Mock certificate issuance - in production, call Hedera SDK
    setTimeout(() => {
      toast.success("Certificate issued successfully!");
      navigate("/dashboard/certificates");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
          <Link to="/dashboard">
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
              <Link to="/dashboard" className="flex-1">
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
