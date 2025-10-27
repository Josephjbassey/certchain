import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, CheckCircle, Award, Loader2, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

const Institution = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      // @ts-ignore
      const { data } = await supabase.from('profiles')
        .select('*, institutions(*)')
        .eq('id', user?.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user
  });

  const institution = profile && typeof profile === 'object' && 'institutions' in profile ? (profile as any).institutions : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Institution Settings</h1>
        <p className="text-muted-foreground">Configure your institution profile and credentials</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>Institution Profile</CardTitle>
                  <CardDescription>Basic information about your institution</CardDescription>
                </div>
              </div>
              {institution?.verified && (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Institution Name</Label>
              <Input id="name" value={institution?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" value={institution?.domain || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="did">DID</Label>
              <Input id="did" value={institution?.did || ''} disabled className="font-mono text-xs" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Hedera Configuration</CardTitle>
                <CardDescription>Blockchain and token settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">Treasury Account ID</Label>
              <Input id="account" value={institution?.treasury_account_id || 'Not configured'} disabled className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token">Collection Token ID</Label>
              <Input id="token" value={institution?.collection_token_id || 'Not created'} disabled className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">HCS Topic ID</Label>
              <Input id="topic" value={institution?.hcs_topic_id || 'Not configured'} disabled className="font-mono" />
            </div>
            <Button variant="outline">Configure Hedera Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Institution;
