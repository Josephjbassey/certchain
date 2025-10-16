import { Shield, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const BatchIssue = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CertChain</span>
        </Link>
        <Link to="/dashboard"><Button variant="ghost" size="sm">Back</Button></Link>
      </div>
    </header>
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Batch Issue Certificates</h1>
      <Card className="p-8 text-center space-y-4">
        <Upload className="h-16 w-16 text-primary mx-auto" />
        <p>Upload CSV to issue multiple certificates</p>
        <Button variant="hero">Upload CSV File</Button>
      </Card>
    </div>
  </div>
);
export default BatchIssue;
