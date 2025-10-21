import { Shield, Target, Users, Zap, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Building Trust in
            <span className="block bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Digital Credentials
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            CertChain is revolutionizing certificate verification with blockchain technology, 
            making credentials instantly verifiable, tamper-proof, and universally accessible.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          <Card className="p-8 space-y-4 gradient-card shadow-elevated">
            <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To eliminate credential fraud and streamline verification processes by leveraging 
              Hedera's enterprise-grade distributed ledger technology. We empower institutions 
              to issue tamper-proof certificates that are instantly verifiable anywhere in the world.
            </p>
          </Card>

          <Card className="p-8 space-y-4 gradient-card shadow-elevated">
            <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              A world where every credential is self-sovereign, portable, and verifiable in seconds. 
              We envision a future where individuals own their achievements and institutions can 
              issue credentials with complete confidence in their authenticity.
            </p>
          </Card>
        </div>

        {/* Why Hedera */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Hedera Hashgraph?</h2>
            <p className="text-muted-foreground text-lg">
              We chose Hedera for its unmatched performance, security, and sustainability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Fast & Scalable",
                description: "10,000+ transactions per second with 3-5 second finality"
              },
              {
                title: "Low Cost",
                description: "Fixed, predictable fees as low as $0.0001 per transaction"
              },
              {
                title: "Carbon Negative",
                description: "Energy-efficient consensus with carbon offset purchases"
              },
              {
                title: "Enterprise Grade",
                description: "Used by Google, IBM, Boeing, and leading institutions"
              },
              {
                title: "Regulatory Compliant",
                description: "ABFT consensus provides bank-grade security"
              },
              {
                title: "Fair & Transparent",
                description: "Governed by a diverse council of global organizations"
              }
            ].map((item) => (
              <Card key={item.title} className="p-6 space-y-2">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full gradient-hero shadow-glow">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Trust</h3>
              <p className="text-muted-foreground">
                Building systems that institutions and individuals can rely on with complete confidence
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full gradient-hero shadow-glow">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Accessibility</h3>
              <p className="text-muted-foreground">
                Making blockchain technology accessible to everyone, regardless of technical expertise
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full gradient-hero shadow-glow">
                <Globe className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold">Innovation</h3>
              <p className="text-muted-foreground">
                Continuously pushing boundaries to create better credential verification solutions
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-12 gradient-card shadow-elevated">
            <Users className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Join Us in Building the Future</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Whether you're an educational institution, certification body, or enterprise, 
              CertChain provides the infrastructure you need to issue trusted credentials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button variant="hero" size="lg">
                  Get Started Today
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
