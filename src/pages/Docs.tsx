import { Shield, Book, Code, Rocket, FileText, Key, Webhook, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { useAuth } from "@/lib/auth-context";

const Docs = () => {
  const { user } = useAuth();
  const sections = [
    {
      title: "Getting Started",
      icon: Rocket,
      description: "Quick start guide to issuing your first certificate",
      links: [
        "Create an Account",
        "Connect Hedera Wallet",
        "Issue Your First Certificate",
        "Verify a Certificate"
      ]
    },
    {
      title: "API Reference",
      icon: Code,
      description: "Complete API documentation for developers",
      links: [
        "Authentication",
        "Certificate Endpoints",
        "Verification API",
        "Webhook Events"
      ]
    },
    {
      title: "Integration Guides",
      icon: Zap,
      description: "Step-by-step integration tutorials",
      links: [
        "Hedera SDK Setup",
        "DID Integration",
        "IPFS Configuration",
        "Smart Contract Deployment"
      ]
    },
    {
      title: "Best Practices",
      icon: FileText,
      description: "Security and optimization guidelines",
      links: [
        "Security Checklist",
        "Performance Optimization",
        "Error Handling",
        "Rate Limiting"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full gradient-hero mb-6 shadow-glow">
            <Book className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to integrate CertChain into your applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {sections.map((section) => (
            <Card key={section.title} className="p-8 space-y-6 hover:shadow-elevated transition-smooth">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                  <p className="text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <button className="text-sm text-primary hover:underline">
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Popular Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center space-y-3 hover:shadow-elevated transition-smooth">
              <Key className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-semibold">API Keys</h3>
              <p className="text-sm text-muted-foreground">Generate and manage API keys</p>
              {user ? (
                <Link to="/settings/api-keys">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Keys
                  </Button>
                </Link>
              ) : (
                <Link to="/auth/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In to Access
                  </Button>
                </Link>
              )}
            </Card>

            <Card className="p-6 text-center space-y-3 hover:shadow-elevated transition-smooth">
              <Webhook className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-semibold">Webhooks</h3>
              <p className="text-sm text-muted-foreground">Set up event notifications</p>
              {user ? (
                <Link to="/settings/webhooks">
                  <Button variant="outline" size="sm" className="w-full">
                    Configure
                  </Button>
                </Link>
              ) : (
                <Link to="/auth/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In to Access
                  </Button>
                </Link>
              )}
            </Card>

            <Card className="p-6 text-center space-y-3 hover:shadow-elevated transition-smooth">
              <Code className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-semibold">Code Examples</h3>
              <p className="text-sm text-muted-foreground">Ready-to-use code snippets</p>
              <a href="https://github.com/hedera-dev/hedera-code-snippets" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="w-full">
                  View Examples
                </Button>
              </a>
            </Card>
          </div>
        </div>

        {/* Code Example */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="p-8 bg-muted/30">
            <h3 className="text-xl font-bold mb-4">Quick Example: Issue Certificate</h3>
            <pre className="bg-background p-6 rounded-lg overflow-x-auto text-sm">
              <code>{`// Initialize CertChain SDK
import { CertChain } from '@certchain/sdk';

const certchain = new CertChain({
  apiKey: 'your_api_key',
  network: 'testnet'
});

// Issue a certificate
const certificate = await certchain.certificates.create({
  recipientName: 'John Doe',
  recipientEmail: 'john@example.com',
  courseName: 'Blockchain Development',
  metadata: {
    grade: 'A+',
    skills: ['Smart Contracts', 'DeFi']
  }
});

console.log('Certificate ID:', certificate.id);
console.log('Serial Number:', certificate.serialNumber);`}</code>
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Docs;
