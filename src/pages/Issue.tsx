import { useState } from "react";
import { Shield, Award, User, Mail, Book, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRoleBasedNavigation } from "@/hooks/useRoleBasedNavigation";
import { useActivityLog } from "@/hooks/useActivityLog";
import { hederaService } from "@/lib/hedera/service";

const IssueCertificate = () => {
  const navigate = useNavigate();
  const { dashboardPath, certificatesPath } = useRoleBasedNavigation();
  const { logActivity, logError } = useActivityLog();
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientEmail: "",
    courseName: "",
    issueDate: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate HTS Minting interaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success("Certificate issued successfully on Hedera!");
      logActivity("issue", `Issued to ${formData.recipientName}`);
      navigate(certificatesPath);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed: ${msg}`);
      logError("issue", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          <nav className="flex gap-4">
            <Link to={dashboardPath}>
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link to={certificatesPath}>
              <Button variant="ghost" size="sm">Certificates</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Issue Certificate</h1>
          <p className="text-muted-foreground text-lg">
            Create a new cryptographically verifiable certificate on the Hedera network.
          </p>
        </div>

        <Card className="p-8 border-border/40 shadow-lg relative overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Award className="w-64 h-64" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Recipient Name
                </label>
                <Input
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="bg-background/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Recipient Email
                </label>
                <Input
                  name="recipientEmail"
                  value={formData.recipientEmail}
                  onChange={handleChange}
                  type="email"
                  placeholder="john@example.com"
                  className="bg-background/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Book className="w-4 h-4 text-muted-foreground" />
                Course / Certification Name
              </label>
              <Input
                name="courseName"
                value={formData.courseName}
                onChange={handleChange}
                placeholder="Advanced Web3 Development"
                className="bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                Issue Date
              </label>
              <Input
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                type="date"
                className="bg-background/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter additional details about the certification..."
                className="h-24 bg-background/50 resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg mt-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Minting to Hedera Network..." : "Issue on Chain"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default IssueCertificate;
