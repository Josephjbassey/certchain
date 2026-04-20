import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TwoFactor() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md glass-panel border-white/10 text-center p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            2FA is not required when using Web3 Wallet authentication.
          </p>
          <Link to="/dashboard" className="block">
            <Button className="w-full h-12 bg-primary text-black hover:bg-primary/90 transition-all">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
