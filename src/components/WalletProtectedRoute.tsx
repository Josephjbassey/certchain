import { ReactNode } from 'react';
import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

interface WalletProtectedRouteProps {
  children: ReactNode;
}

export function WalletProtectedRoute({ children }: WalletProtectedRouteProps) {
  const { accountId, isConnected } = useHederaWallet();

  if (!isConnected || !accountId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect a Hedera wallet to access this page
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Connect with HashPack, Blade, or any Hedera-compatible wallet to continue.
              </p>
              <Button size="lg" className="w-full">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
