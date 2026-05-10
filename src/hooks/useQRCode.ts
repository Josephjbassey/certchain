import { useState, useCallback } from "react";
import QRCode from "qrcode";

export function useQRCode() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = useCallback(
    async (data: string): Promise<string | null> => {
      setIsGenerating(true);
      try {
        const qrDataUrl = await QRCode.toDataURL(data, {
          width: 300,
          margin: 2,
          color: {
            dark: "#164734",
            light: "#FFFFFF",
          },
        });
        return qrDataUrl;
      } catch (err) {
        console.error("QR code generation error:", err);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    isGenerating,
    generateQRCode,
  };
}
