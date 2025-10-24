import { CreditCard, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const Billing = () => {
  const { user } = useAuth();

  // Get user's institution
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user?.id)
        .single();
      return data;
    },
    enabled: !!user
  });

  // Get institution details for subscription info
  const { data: institution } = useQuery({
    queryKey: ['institution', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return null;
      
      const { data } = await supabase
        .from('institutions')
        .select('subscription_tier, name')
        .eq('id', profile.institution_id)
        .single();
      
      return data;
    },
    enabled: !!profile?.institution_id
  });

  // Fetch certificate transactions from audit_logs
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['billing-transactions', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return [];
      
      // Get certificate issuance events from audit logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('id, action, created_at, metadata, target_id')
        .eq('institution_id', profile.institution_id)
        .in('action', ['certificate_issued', 'certificate_minted', 'batch_upload'])
        .order('created_at', { ascending: false })
        .limit(50);
      
      // Group by month and calculate costs
      const monthlyMap = new Map();
      logs?.forEach(log => {
        const date = new Date(log.created_at || '');
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            id: monthKey,
            date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
            count: 0,
            logs: []
          });
        }
        
        const month = monthlyMap.get(monthKey);
        month.count++;
        month.logs.push(log);
      });
      
      // Convert to transactions with pricing
      const pricePerCert = 0.50; // $0.50 per certificate
      return Array.from(monthlyMap.values()).map(month => ({
        id: month.id,
        date: month.date,
        description: `Certificate issuance (${month.count} ${month.count === 1 ? 'cert' : 'certs'})`,
        amount: month.count * pricePerCert,
        status: 'paid'
      })).slice(0, 10); // Show last 10 transactions
    },
    enabled: !!profile?.institution_id
  });

  // Calculate billing stats
  const stats = {
    monthlySpend: transactions?.[0]?.amount || 0,
    totalSpend: transactions?.reduce((sum, t) => sum + t.amount, 0) || 0,
    nextBillingDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 20).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };

  const subscriptionTier = institution?.subscription_tier || 'professional';
  const planName = subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your billing and view usage</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planName}</div>
            <p className="text-xs text-muted-foreground">Usage-based pricing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlySpend.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">This billing period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nextBillingDate}</div>
            <p className="text-xs text-muted-foreground">Auto-renew enabled</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your plan details and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{planName} Plan</h3>
                <p className="text-sm text-muted-foreground">$0.50 per certificate</p>
              </div>
              <Button variant="outline">Change Plan</Button>
            </div>
            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Unlimited templates</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Batch issuance</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Custom branding</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>API access</span>
                <Badge variant="secondary">Included</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Blockchain verification</span>
                <Badge variant="secondary">Included</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent billing transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
          ) : transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {transaction.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">
                Start issuing certificates to see your billing history
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
