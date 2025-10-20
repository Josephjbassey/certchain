import { Shield, Puzzle, CheckCircle2, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Integrations = () => {
  const integrations = [
    {
      name: "Hedera Network",
      description: "Decentralized ledger for certificate issuance and verification",
      logo: "🔷",
      status: "connected",
      features: ["HTS Token Service", "HCS Consensus", "DID Management"],
      documentation: "https://docs.hedera.com",
    },
    {
      name: "Pinata / IPFS",
      description: "Decentralized storage for certificate metadata",
      logo: "📌",
      status: "connected",
      features: ["Metadata Storage", "Gateway Access", "Content Pinning"],
      documentation: "https://docs.pinata.cloud",
    },
    {
      name: "Reown AppKit",
      description: "Wallet connection and authentication",
      logo: "🔐",
      status: "connected",
      features: ["Wallet Connect", "Multi-wallet Support", "Session Management"],
      documentation: "https://docs.reown.com",
    },
    {
      name: "Supabase",
      description: "Backend infrastructure and database",
      logo: "⚡",
      status: "connected",
      features: ["Authentication", "Database", "Edge Functions"],
      documentation: "https://supabase.com/docs",
    },
    {
      name: "Zapier",
      description: "Automate workflows with 5,000+ apps",
      logo: "⚙️",
      status: "available",
      features: ["Workflow Automation", "Trigger Events", "Data Sync"],
      documentation: "#",
      comingSoon: true,
    },
    {
      name: "Slack",
      description: "Get notifications in your Slack workspace",
      logo: "💬",
      status: "available",
      features: ["Real-time Alerts", "Team Notifications", "Custom Channels"],
      documentation: "#",
      comingSoon: true,
    },
    {
      name: "Google Workspace",
      description: "Sync with Google Sheets, Drive, and more",
      logo: "📊",
      status: "available",
      features: ["Sheets Integration", "Drive Storage", "Calendar Events"],
      documentation: "#",
      comingSoon: true,
    },
    {
      name: "Microsoft 365",
      description: "Integrate with Teams, Outlook, and SharePoint",
      logo: "📧",
      status: "available",
      features: ["Teams Notifications", "Email Integration", "SharePoint Storage"],
      documentation: "#",
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CertChain</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect CertChain with your favorite tools and services
          </p>
        </div>

        {/* Connected Integrations */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Core Integrations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {integrations.filter(i => i.status === 'connected').map((integration) => (
              <Card key={integration.name} className="gradient-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{integration.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(integration.documentation, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Documentation
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Integrations */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.filter(i => i.status === 'available').map((integration) => (
              <Card key={integration.name} className="relative overflow-hidden">
                {integration.comingSoon && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="h-3 w-3" />
                      Coming Soon
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{integration.logo}</div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={integration.comingSoon}
                    >
                      {integration.comingSoon ? 'Coming Soon' : 'Connect'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Integration CTA */}
        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-4 py-8">
              <Puzzle className="h-12 w-12 text-primary mx-auto" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Need a Custom Integration?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Our enterprise plan includes custom integration development.
                  Contact our team to discuss your specific requirements.
                </p>
              </div>
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  Contact Sales
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integrations;
