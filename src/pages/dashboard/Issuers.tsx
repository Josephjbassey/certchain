import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, UserCheck, UserPlus, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const Issuers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get current user's institution
  const { data: currentUserProfile } = useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await (supabase as any)
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single();
      return data as { institution_id: string | null } | null;
    },
    enabled: !!user,
  });

  // Get all users in the same institution
  const { data: institutionUsers, isLoading } = useQuery({
    queryKey: ['institution-users', currentUserProfile?.institution_id],
    queryFn: async () => {
      if (!currentUserProfile || !currentUserProfile.institution_id) return [];
      
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('*, user_roles(role)')
        .eq('institution_id', currentUserProfile.institution_id)
        .order('created_at', { ascending: false });
      
      return profiles || [];
    },
    enabled: !!currentUserProfile?.institution_id,
  });

  // Get all issuers (users with issuer or admin role)
  const issuers = institutionUsers?.filter((user: any) => 
    user.user_roles?.some((r: any) => r.role === 'issuer' || r.role === 'admin')
  );

  // Get candidates (users without issuer role in the institution)
  const candidates = institutionUsers?.filter((user: any) => 
    !user.user_roles?.some((r: any) => r.role === 'issuer' || r.role === 'admin')
  );

  const addIssuerMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Check if user already has issuer role
      const { data: existingRole } = await (supabase as any)
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'issuer')
        .maybeSingle();

      if (existingRole) {
        throw new Error('User is already an issuer');
      }

      const { error } = await (supabase as any)
        .from('user_roles')
        .insert({ user_id: userId, role: 'issuer' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-users'] });
      toast.success("Issuer added successfully");
      setIsAddDialogOpen(false);
      setSelectedUserId("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add issuer");
    }
  });

  const removeIssuerMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await (supabase as any)
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'issuer');
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-users'] });
      toast.success("Issuer removed successfully");
    },
    onError: () => {
      toast.error("Failed to remove issuer");
    }
  });

  const filteredIssuers = issuers?.filter((issuer: any) =>
    issuer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issuer.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (roles: any[]) => {
    if (!roles || roles.length === 0) return null;
    const role = roles.find((r: any) => r.role === 'admin' || r.role === 'issuer');
    if (!role) return null;
    
    const variant = role.role === 'admin' ? 'destructive' : 'default';
    return <Badge variant={variant}>{role.role}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Authorized Issuers</h1>
        <p className="text-muted-foreground">Manage users who can issue certificates</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Active Issuers
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issuers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Issuer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Issuer</DialogTitle>
                    <DialogDescription>
                      Select a user from your institution to grant issuer permissions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="user">Select User</Label>
                      <select
                        id="user"
                        className="w-full px-3 py-2 rounded-md border border-border bg-background"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                      >
                        <option value="">Choose a user...</option>
                        {candidates?.map((candidate: any) => (
                          <option key={candidate.id} value={candidate.id}>
                            {candidate.display_name || candidate.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => selectedUserId && addIssuerMutation.mutate(selectedUserId)}
                      disabled={!selectedUserId || addIssuerMutation.isPending}
                    >
                      Add Issuer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading issuers...</p>
          ) : filteredIssuers?.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No issuers found</p>
              <p className="text-sm text-muted-foreground">Add users to grant them issuer permissions</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Hedera Account</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssuers?.map((issuer: any) => (
                  <TableRow key={issuer.id}>
                    <TableCell className="font-medium">{issuer.email}</TableCell>
                    <TableCell>{issuer.display_name || '-'}</TableCell>
                    <TableCell>{getRoleBadge(issuer.user_roles)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {issuer.hedera_account_id || 'Not connected'}
                    </TableCell>
                    <TableCell>{new Date(issuer.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {issuer.user_roles?.some((r: any) => r.role === 'admin') ? (
                        <Badge variant="secondary">Admin</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIssuerMutation.mutate(issuer.id)}
                          disabled={removeIssuerMutation.isPending}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Issuers;
