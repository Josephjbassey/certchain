import { CreditCard, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Billing = () => {
  const transactions = [
    { id: 1, date: "2024-10-20", description: "Certificate issuance (50 certs)", amount: 25.00, status: "paid" },
    { id: 2, date: "2024-09-20", description: "Certificate issuance (30 certs)", amount: 15.00, status: "paid" },
    { id: 3, date: "2024-08-20", description: "Certificate issuance (75 certs)", amount: 37.50, status: "paid" }
  ];

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
            <div className="text-2xl font-bold">Professional</div>
            <p className="text-xs text-muted-foreground">Billed monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$25.00</div>
            <p className="text-xs text-muted-foreground">This billing period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nov 20</div>
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
                <h3 className="font-semibold">Professional Plan</h3>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;
