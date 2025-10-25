import { Shield, Settings, User, Mail, Building2, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AccountSettings = () => {
  const [displayName, setDisplayName] = useState("");
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Set initial form values
      setDisplayName(profile.display_name || profile.email || '');
      
      return { ...profile, email: user.email };
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { display_name?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });

  const handleSave = () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    updateProfileMutation.mutate({
      display_name: displayName
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CertChain</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        {isLoading ? (
          <Card className="p-6 text-center">
            <Settings className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
            <p>Loading profile...</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg bg-primary/10">
                      {displayName ? getInitials(displayName) : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Profile Avatar</p>
                    <p className="text-xs text-muted-foreground">Generated from your display name</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      placeholder="Your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                {profile?.institution_id && (
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Institution ID: {profile.institution_id}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                size="lg"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
