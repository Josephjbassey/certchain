import { Shield, CheckCircle2, Zap, Award, ArrowRight, Sparkles, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/verify" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
              Verify
            </Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
              Pricing
            </Link>
            <Link to="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
              Docs
            </Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth/signup">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm text-primary font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>Powered by Hedera Hashgraph</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Decentralized Certificate
              <span className="block bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Verification Platform
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Issue, verify, and manage tamper-proof certificates on Hedera blockchain. 
              Instant verification, permanent records, and complete transparency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/auth/signup">
                <Button variant="hero" size="lg" className="group">
                  Start Issuing Certificates
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
                </Button>
              </Link>
              <Link to="/verify">
                <Button variant="outline" size="lg">
                  Verify a Certificate
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Instant Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <span>Immutable Records</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span>Global Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose CertChain?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built on Hedera's enterprise-grade distributed ledger technology for unmatched security and speed.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 space-y-4 gradient-card border-border/50 shadow-elevated hover:shadow-glow transition-smooth cert-shine">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Tamper-Proof</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every certificate is cryptographically signed and stored on Hedera's immutable ledger. 
                Impossible to forge or alter.
              </p>
            </Card>
            
            <Card className="p-8 space-y-4 gradient-card border-border/50 shadow-elevated hover:shadow-glow transition-smooth cert-shine">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">Instant Verification</h3>
              <p className="text-muted-foreground leading-relaxed">
                Verify certificates in seconds with QR codes or certificate IDs. 
                Real-time blockchain validation.
              </p>
            </Card>
            
            <Card className="p-8 space-y-4 gradient-card border-border/50 shadow-elevated hover:shadow-glow transition-smooth cert-shine">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold">DID Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Decentralized identifiers (DIDs) ensure complete ownership and portability of your credentials.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple, secure, and scalable certificate management</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              { step: "1", title: "Create Account", desc: "Sign up and connect your Hedera wallet" },
              { step: "2", title: "Issue Certificates", desc: "Upload recipient data and generate NFT certificates" },
              { step: "3", title: "Store on IPFS", desc: "Certificate metadata stored on decentralized IPFS" },
              { step: "4", title: "Verify Anywhere", desc: "Recipients share verifiable certificates globally" }
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="h-16 w-16 mx-auto rounded-full gradient-accent text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-elevated">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Certification Process?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join institutions worldwide using blockchain for credential verification
            </p>
            <Link to="/auth/signup">
              <Button variant="hero" size="lg" className="text-lg px-8">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">CertChain</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Decentralized certificate verification powered by Hedera.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/verify" className="hover:text-foreground transition-smooth">Verify</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-smooth">Pricing</Link></li>
                <li><Link to="/docs" className="hover:text-foreground transition-smooth">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-smooth">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-smooth">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/settings/privacy" className="hover:text-foreground transition-smooth">Privacy</Link></li>
                <li><Link to="/settings/security" className="hover:text-foreground transition-smooth">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 CertChain. Built on Hedera. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
