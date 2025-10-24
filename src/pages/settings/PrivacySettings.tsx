import { Shield, Eye, EyeOff, Globe, Lock, UserX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PrivacySettings = () => {
  const [profileVisibility, setProfileVisibility] = useState<string>("private");
  const [showEmail, setShowEmail] = useState(false);
  const [showCertificates, setShowCertificates] = useState(true);
  const [allowSearch, setAllowSearch] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);

  const handleSavePrivacy = () => {
    // TODO: Save to database/user preferences
    toast.success("Privacy settings updated");
  };

  const handleExportData = () => {
    toast.info("Preparing your data export...", {
      description: "You'll receive an email with a download link shortly"
    });
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion initiated", {
      description: "Your account and all data will be permanently deleted in 30 days"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/candidate/dashboard" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CertChain</span>
          </Link>
          <Link to="/candidate/dashboard">
            <Button variant="ghost" size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy Settings</h1>
          <p className="text-muted-foreground">
            Control your data visibility and privacy preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile and certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibility">Profile Visibility</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Public - Anyone can view</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="verified">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span>Verified Only - Only verified institutions</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>Private - Only you can view</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {profileVisibility === 'public' && 'Your profile and certificates can be found via search and direct link'}
                  {profileVisibility === 'verified' && 'Only verified institutions and employers can view your profile'}
                  {profileVisibility === 'private' && 'Your profile is completely private'}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-email">Show Email Address</Label>
                  <p className="text-xs text-muted-foreground">
                    Display your email on your public profile
                  </p>
                </div>
                <Switch
                  id="show-email"
                  checked={showEmail}
                  onCheckedChange={setShowEmail}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-certs">Show Certificates</Label>
                  <p className="text-xs text-muted-foreground">
                    Display your earned certificates on your profile
                  </p>
                </div>
                <Switch
                  id="show-certs"
                  checked={showCertificates}
                  onCheckedChange={setShowCertificates}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="search">Allow Search Indexing</Label>
                  <p className="text-xs text-muted-foreground">
                    Let search engines index your public profile
                  </p>
                </div>
                <Switch
                  id="search"
                  checked={allowSearch}
                  onCheckedChange={setAllowSearch}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data & Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Data & Analytics</CardTitle>
              <CardDescription>
                Manage how your data is used and collected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Usage Analytics</Label>
                  <p className="text-xs text-muted-foreground">
                    Help improve CertChain by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={dataCollection}
                  onCheckedChange={setDataCollection}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or delete your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your account data and certificates
                  </p>
                </div>
                <Button variant="outline" onClick={handleExportData}>
                  Export Data
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <UserX className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account,
                        remove all your certificates from our servers, and revoke access to all
                        connected services.
                        <br /><br />
                        Your on-chain certificates (NFTs) will remain on Hedera but will be marked as revoked.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Delete My Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSavePrivacy}>
              Save Privacy Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
