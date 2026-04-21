import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Database, Shield, Zap } from "lucide-react";

const SystemSettings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Hedera Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Hedera Network Configuration
            </CardTitle>
            <CardDescription>Configure Hedera network settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Input id="network" value="testnet" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator-id">Operator Account ID</Label>
              <Input id="operator-id" placeholder="0.0.xxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hcs-topic">Default HCS Topic ID</Label>
              <Input id="hcs-topic" placeholder="0.0.xxxxx" />
            </div>
            <Button>Save Hedera Settings</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Manage security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Users must verify email before accessing system</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Allow users to enable 2FA</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Institution Verification</Label>
                <p className="text-sm text-muted-foreground">Institutions must be verified before issuing</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* IPFS/Storage Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Storage Configuration
            </CardTitle>
            <CardDescription>Configure IPFS and Pinata settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pinata-gateway">Pinata Gateway URL</Label>
              <Input id="pinata-gateway" placeholder="https://gateway.pinata.cloud/ipfs/" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable IPFS Pinning</Label>
                <p className="text-sm text-muted-foreground">Automatically pin certificates to IPFS</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>Save Storage Settings</Button>
          </CardContent>
        </Card>

        {/* System Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Maintenance
            </CardTitle>
            <CardDescription>Maintenance and system operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">Clear Cache</Button>
            <Button variant="outline" className="w-full">Sync Certificate Cache</Button>
            <Button variant="outline" className="w-full">Reindex Database</Button>
            <Separator />
            <Button variant="destructive" className="w-full">Restart System Services</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
