import { useState, useRef, useEffect } from "react";
import { Shield, ScanLine, Camera, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PublicHeader } from "@/components/PublicHeader";

const VerifyScan = () => {
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const scanIntervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      stopScan();
    };
  }, []);

  const drawScanFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return imageData;
  };

  const detectQRCode = (imageData: ImageData): string | null => {
    // Simple QR code detection using pattern recognition
    // This is a basic implementation - for production, consider using jsQR library
    // For now, we'll look for common QR patterns in the data
    
    const data = imageData.data;
    let darkPixels = 0;
    let lightPixels = 0;

    // Sample pixels to detect QR-like patterns
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness < 128) darkPixels++;
      else lightPixels++;
    }

    // Basic heuristic: QR codes have roughly 50/50 dark/light ratio
    const ratio = darkPixels / (darkPixels + lightPixels);
    if (ratio > 0.3 && ratio < 0.7) {
      // Simulated QR detection - in production, use proper QR library
      return null; // Will be replaced by actual QR detection
    }

    return null;
  };

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        toast.success("Camera activated. Position QR code in view.");

        // Start scanning loop
        videoRef.current.onloadedmetadata = () => {
          scanIntervalRef.current = window.setInterval(() => {
            const imageData = drawScanFrame();
            if (imageData) {
              const qrCode = detectQRCode(imageData);
              if (qrCode) {
                toast.success("QR code detected!");
                stopScan(stream);
                navigate(`/verify/status/${qrCode}`);
              }
            }
          }, 500); // Scan every 500ms
        };

        // NOTE: For production QR scanning, integrate jsQR library:
        // 1. npm install jsqr
        // 2. import jsQR from 'jsqr'
        // 3. Replace detectQRCode with:
        //    const code = jsQR(imageData.data, imageData.width, imageData.height);
        //    if (code) { navigate(`/verify/status/${code.data}`); }
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
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

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
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            toast.error("Failed to process image");
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // NOTE: For production, use jsQR here:
          // const code = jsQR(imageData.data, imageData.width, imageData.height);
          // if (code) { navigate(`/verify/status/${code.data}`); }
          
          // Simulate QR detection for demo
          const qrCode = detectQRCode(imageData);
          if (qrCode) {
            toast.success("QR code detected!");
            navigate(`/verify/status/${qrCode}`);
          } else {
            // For demo: assume valid QR if image meets basic criteria
            toast.info("For full QR scanning, install jsQR library");
            // Uncomment for demo: navigate(`/verify/status/0.0.123456:1`);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('QR processing error:', error);
      toast.error("Failed to process QR code from image");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hidden canvas for QR processing */}
      <canvas ref={canvasRef} className="hidden" />

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
