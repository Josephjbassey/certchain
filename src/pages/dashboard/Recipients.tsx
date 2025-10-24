import { Users, UserPlus, Search, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

const Recipients = () => {
  const [searchTerm, setSearchTerm] = useState("");
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

  // Fetch recipients from certificate_cache
  const { data: recipients, isLoading } = useQuery({
    queryKey: ['recipients', profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return [];
      
      const { data: certificates } = await supabase
        .from('certificate_cache')
        .select('recipient_email, recipient_did, recipient_account_id, issued_at')
        .eq('institution_id', profile.institution_id)
        .not('recipient_email', 'is', null)
        .order('issued_at', { ascending: false });
      
      // Group by recipient email
      const recipientMap = new Map();
      certificates?.forEach(cert => {
        const email = cert.recipient_email;
        if (!email) return;
        
        const existing = recipientMap.get(email);
        if (existing) {
          existing.certificates++;
          if (new Date(cert.issued_at) > new Date(existing.lastIssued)) {
            existing.lastIssued = cert.issued_at;
          }
        } else {
          recipientMap.set(email, {
            id: email,
            name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            email: email,
            certificates: 1,
            lastIssued: cert.issued_at,
            accountId: cert.recipient_account_id,
            did: cert.recipient_did
          });
        }
      });
      
      return Array.from(recipientMap.values());
    },
    enabled: !!profile?.institution_id
  });

  const filteredRecipients = recipients?.filter(recipient =>
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const thisMonthCount = recipients?.filter(r => {
    const date = new Date(r.lastIssued);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Recipients Management</h1>
          <p className="text-muted-foreground">Manage certificate recipients and their credentials</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Recipient
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Recipients</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <CardDescription>
            {filteredRecipients.length} recipients {searchTerm ? 'found' : 'total'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading recipients...</div>
          ) : filteredRecipients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Certificates</TableHead>
                  <TableHead>Last Issued</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">{recipient.name}</TableCell>
                    <TableCell>{recipient.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{recipient.certificates}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(recipient.lastIssued)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" title="Send email">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recipients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Start issuing certificates to add recipients'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipients?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recipients?.reduce((sum, r) => sum + r.certificates, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthCount}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Recipients;
