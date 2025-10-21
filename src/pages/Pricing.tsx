import { Shield, Check, Zap, Building, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "49",
      icon: Zap,
      description: "Perfect for small institutions getting started",
      features: [
        "Up to 100 certificates/month",
        "Basic verification",
        "Email support",
        "1 authorized issuer",
        "Standard templates"
      ]
    },
    {
      name: "Professional",
      price: "149",
      icon: Building,
      description: "Ideal for growing organizations",
      popular: true,
      features: [
        "Up to 1,000 certificates/month",
        "Advanced verification",
        "Priority support",
        "5 authorized issuers",
        "Custom templates",
        "API access",
        "Analytics dashboard"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      icon: Rocket,
      description: "For large institutions with custom needs",
      features: [
        "Unlimited certificates",
        "White-label solution",
        "24/7 dedicated support",
        "Unlimited issuers",
        "Custom integrations",
        "Advanced analytics",
        "SLA guarantee",
        "On-premise option"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your institution's needs. All plans include blockchain verification on Hedera.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-8 space-y-6 relative ${plan.popular ? 'border-primary shadow-glow' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full gradient-hero text-primary-foreground text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <plan.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="pt-4">
                  {plan.price === "Custom" ? (
                    <div className="text-4xl font-bold">Contact Us</div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth/signup">
                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-muted/30">
            <h3 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">What's included in all plans?</h4>
                <p className="text-sm text-muted-foreground">
                  All plans include blockchain verification on Hedera, IPFS storage, and basic support.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Can I upgrade later?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time from your dashboard.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Are there setup fees?</h4>
                <p className="text-sm text-muted-foreground">
                  No setup fees for Starter and Professional plans. Enterprise may have custom setup.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, wire transfers, and cryptocurrency payments.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
