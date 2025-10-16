import { useState } from "react";
import { Shield, ScanLine, Camera, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const VerifyScan = () => {
  const [scanning, setScanning] = useState(false);

  const startScan = () => {
    setScanning(true);
    toast.info("Camera access required. Please allow camera permissions.");
    // In production: Initialize QR scanner with camera
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.success("Processing QR code from image...");
      // In production: Parse QR code from uploaded image
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CertChain
            </span>
          </Link>
          <Link to="/verify">
            <Button variant="ghost" size="sm">Back to Verify</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full gradient-hero mb-6 shadow-glow">
            <ScanLine className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Scan QR Code</h1>
          <p className="text-muted-foreground text-lg">
            Scan a certificate QR code or upload an image to verify instantly
          </p>
        </div>

        {!scanning ? (
          <div className="space-y-6">
            <Card className="p-8 space-y-6 shadow-elevated">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={startScan}
              >
                <Camera className="h-5 w-5" />
                <span className="ml-2">Start Camera Scanner</span>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="qr-upload"
                />
                <label htmlFor="qr-upload">
                  <Button variant="outline" size="lg" className="w-full" asChild>
                    <span>
                      <Upload className="h-5 w-5" />
                      <span className="ml-2">Upload QR Code Image</span>
                    </span>
                  </Button>
                </label>
              </div>
            </Card>

            <Card className="p-6 bg-muted/30 border-border/50">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">How to scan:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Position the QR code within the camera frame</li>
                    <li>• Ensure good lighting for best results</li>
                    <li>• Hold steady until the code is recognized</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 space-y-6 shadow-elevated">
            <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-4">
                <ScanLine className="h-16 w-16 text-primary mx-auto animate-pulse" />
                <p className="text-muted-foreground">Position QR code in view</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setScanning(false)}
              className="w-full"
            >
              Cancel
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerifyScan;
