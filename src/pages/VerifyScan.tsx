import { useState, useRef } from "react";
import { Shield, ScanLine, Camera, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PublicHeader } from "@/components/PublicHeader";

const VerifyScan = () => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        toast.success("Camera activated. Position QR code in view.");
        
        // TODO: Integrate QR code detection library (e.g., jsQR, html5-qrcode)
        // For now, simulate detection after 3 seconds
        setTimeout(() => {
          const mockCertId = "0.0.123456:1";
          toast.success("QR code detected!");
          stopScan(stream);
          navigate(`/verify/status/${mockCertId}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Camera access error:', error);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        toast.error("Camera permission denied. Please allow camera access and try again.");
      } else {
        toast.error("Failed to access camera. Please check your device settings.");
      }
    }
  };

  const stopScan = (stream?: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream;
      currentStream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload a valid image file");
      return;
    }

    toast.info("Processing QR code from image...");
    
    try {
      // TODO: Implement QR code extraction from image
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockCertId = "0.0.123456:1";
      toast.success("QR code detected!");
      navigate(`/verify/status/${mockCertId}`);
    } catch (error) {
      console.error('QR processing error:', error);
      toast.error("Failed to process QR code from image");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

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
                    <li>• Or upload an image containing the QR code</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-8 space-y-6 shadow-elevated">
            <div className="aspect-square bg-muted/30 rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-primary/50 rounded-lg" />
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>Position QR code within the frame</p>
            </div>
            <Button
              variant="outline"
              onClick={() => stopScan()}
              className="w-full"
            >
              Cancel Scan
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerifyScan;
