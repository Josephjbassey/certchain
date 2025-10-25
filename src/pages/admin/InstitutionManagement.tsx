import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, CheckCircle, XCircle, Search, Shield, Plus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const InstitutionManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newInstitution, setNewInstitution] = useState({
    name: "",
    domain: "",
    admin_email: ""
  });
  const queryClient = useQueryClient();

  const { data: institutions, isLoading } = useQuery({
    queryKey: ['admin-institutions'],
    queryFn: async () => {
      const { data } = await (supabase as any).from('institutions')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    }
  });

  const verifyInstitutionMutation = useMutation({
    mutationFn: async (institutionId: string) => {
      const { error } = await (supabase as any)
        .from('institutions')
        .update({ verified: true })
        .eq('id', institutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      toast.success("Institution verified successfully");
    },
    onError: () => {
      toast.error("Failed to verify institution");
    }
  });

  const unverifyInstitutionMutation = useMutation({
    mutationFn: async (institutionId: string) => {
      const { error } = await (supabase as any)
        .from('institutions')
        .update({ verified: false })
        .eq('id', institutionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      toast.success("Institution verification revoked");
    },
    onError: () => {
      toast.error("Failed to revoke verification");
    }
  });

  const addInstitutionMutation = useMutation({
    mutationFn: async (data: typeof newInstitution) => {
      // Step 1: Find user by admin email to get their wallet and DID
      if (!data.admin_email || !data.admin_email.trim()) {
        throw new Error('Admin email is required to create institution');
      }

      // Find user by email and get their profile with DID and Hedera account
      const { data: users } = await (supabase as any)
        .from('profiles')
        .select('id, hedera_account_id, did')
        .eq('email', data.admin_email.trim())
        .limit(1);

      if (!users || users.length === 0) {
        throw new Error(`User ${data.admin_email} not found. They must sign up and setup their DID first.`);
      }

      const user = users[0];

      if (!user.hedera_account_id || !user.did) {
        throw new Error(`User ${data.admin_email} must connect their wallet and create a DID first. Please ask them to visit /identity/did-setup`);
      }

      // Step 2: Create institution with auto-populated DID and Hedera account from user's profile
      const { data: institution, error: instError } = await (supabase as any)
        .from('institutions')
        .insert({
          name: data.name,
          domain: data.domain,
          hedera_account_id: user.hedera_account_id, // Auto-populated from user's wallet
          did: user.did, // Auto-populated from user's DID
          admin_user_id: user.id,
          verified: false // Super admin must manually verify
        })
        .select()
        .single();
      
      if (instError) throw instError;

      // Step 3: Assign institution_admin role to the user
      await (supabase as any)
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'institution_admin',
          institution_id: institution.id
        });

      // Step 4: Update user's profile with institution_id
      await (supabase as any)
        .from('profiles')
        .update({ institution_id: institution.id })
        .eq('id', user.id);

      return institution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-institutions'] });
      setIsAddDialogOpen(false);
      setNewInstitution({
        name: "",
        domain: "",
        admin_email: ""
      });
      toast.success("Institution onboarded successfully with admin's wallet and DID");
    },
    onError: (error: any) => {
      toast.error(`Failed to onboard institution: ${error.message}`);
    }
  });

  const filteredInstitutions = institutions?.filter((inst: any) =>
    inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.did?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Institution Management</h1>
        <p className="text-muted-foreground">Manage and verify institutions on the platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Institutions
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Institution
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Onboard New Institution
                    </DialogTitle>
                    <DialogDescription>
                      Add a new institution using an existing user's wallet and DID. The admin must have already signed up and completed DID setup.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Automatic Wallet & DID Integration</AlertTitle>
                      <AlertDescription>
                        The institution will automatically use the admin's Hedera account and DID. Make sure the admin has:
                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                          <li>Signed up for an account</li>
                          <li>Connected their HashPack/Blade wallet in Settings → Wallets</li>
                          <li>Created their DID at /identity/did-setup</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    <div className="space-y-2">
                      <Label htmlFor="name">Institution Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Harvard University"
                        value={newInstitution.name}
                        onChange={(e) => setNewInstitution(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input
                        id="domain"
                        placeholder="e.g., harvard.edu"
                        value={newInstitution.domain}
                        onChange={(e) => setNewInstitution(prev => ({ ...prev, domain: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Used to validate institution admins and instructors
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Institution Admin Email *</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        placeholder="admin@institution.edu"
                        value={newInstitution.admin_email}
                        onChange={(e) => setNewInstitution(prev => ({ ...prev, admin_email: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        This user must have already signed up and completed wallet connection + DID setup. Their wallet and DID will be used for the institution.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={addInstitutionMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => addInstitutionMutation.mutate(newInstitution)}
                      disabled={!newInstitution.name.trim() || !newInstitution.admin_email.trim() || addInstitutionMutation.isPending}
                    >
                      {addInstitutionMutation.isPending ? "Creating..." : "Create Institution"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading institutions...</p>
          ) : filteredInstitutions?.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No institutions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>DID</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collection Token</TableHead>
                  <TableHead>Hedera Account</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstitutions?.map((institution: any) => (
                  <TableRow key={institution.id}>
                    <TableCell className="font-medium">{institution.name}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[150px] truncate">
                      {institution.did || '-'}
                    </TableCell>
                    <TableCell>{institution.domain || '-'}</TableCell>
                    <TableCell>
                      {institution.verified ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {institution.collection_token_id || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {institution.hedera_account_id || '-'}
                    </TableCell>
                    <TableCell>{new Date(institution.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedInstitution(institution)}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Building2 className="h-5 w-5" />
                              {selectedInstitution?.name}
                            </DialogTitle>
                            <DialogDescription>
                              Institution details and verification status
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Name</p>
                                <p className="text-sm text-muted-foreground">{selectedInstitution?.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Domain</p>
                                <p className="text-sm text-muted-foreground">{selectedInstitution?.domain || 'Not set'}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium mb-1">DID</p>
                                <p className="text-sm text-muted-foreground font-mono break-all">
                                  {selectedInstitution?.did || 'Not set'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Hedera Account</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedInstitution?.hedera_account_id || 'Not set'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Treasury Account</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedInstitution?.treasury_account_id || 'Not set'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Collection Token</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedInstitution?.collection_token_id || 'Not created'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">HCS Topic</p>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {selectedInstitution?.hcs_topic_id || 'Not created'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Status</p>
                                {selectedInstitution?.verified ? (
                                  <Badge variant="default" className="flex items-center gap-1 w-fit">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                    <XCircle className="h-3 w-3" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Created</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedInstitution?.created_at && 
                                    new Date(selectedInstitution.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            {selectedInstitution?.verified ? (
                              <Button
                                variant="outline"
                                onClick={() => unverifyInstitutionMutation.mutate(selectedInstitution.id)}
                                disabled={unverifyInstitutionMutation.isPending}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Revoke Verification
                              </Button>
                            ) : (
                              <Button
                                onClick={() => verifyInstitutionMutation.mutate(selectedInstitution.id)}
                                disabled={verifyInstitutionMutation.isPending}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Verify Institution
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {!institution.verified && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => verifyInstitutionMutation.mutate(institution.id)}
                          disabled={verifyInstitutionMutation.isPending}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Verify
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

export default InstitutionManagement;
