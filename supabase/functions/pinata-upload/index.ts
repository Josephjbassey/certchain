import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const pinataJwt = Deno.env.get('PINATA_JWT');
    
    if (!pinataJwt) {
      throw new Error('PINATA_JWT not configured');
    }

    const { certificateData, type = 'metadata' } = await req.json();

    if (!certificateData) {
      throw new Error('certificateData is required');
    }

    console.log('Uploading to Pinata/IPFS:', type);

    let result;

    if (type === 'metadata') {
      // Upload JSON metadata
      const metadata = {
        name: certificateData.courseName || 'Certificate',
        description: `Certificate issued to ${certificateData.recipientEmail}`,
        image: certificateData.imageUrl || '',
        attributes: [
          { trait_type: 'Recipient', value: certificateData.recipientEmail },
          { trait_type: 'Course', value: certificateData.courseName },
          { trait_type: 'Issuer DID', value: certificateData.issuerDid },
          { trait_type: 'Recipient DID', value: certificateData.recipientDid || 'N/A' },
          { trait_type: 'Issued At', value: new Date(certificateData.issuedAt).toISOString() },
          {
            trait_type: 'Expires At',
            value: certificateData.expiresAt
              ? new Date(certificateData.expiresAt).toISOString()
              : 'Never',
          },
        ],
        properties: {
          certificateId: certificateData.certificateId,
          institutionId: certificateData.institutionId,
          courseName: certificateData.courseName,
          skills: certificateData.skills || [],
        },
      };

      // Use Pinata API directly
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata API error: ${errorText}`);
      }

      result = await response.json();
      console.log('Metadata uploaded to IPFS:', result.IpfsHash);
    } else if (type === 'file') {
      // Upload file using multipart form data
      const formData = new FormData();
      const blob = new Blob([certificateData.fileBuffer], { type: certificateData.mimeType });
      formData.append('file', blob, certificateData.fileName);
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJwt}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata API error: ${errorText}`);
      }

      result = await response.json();
      console.log('File uploaded to IPFS:', result.IpfsHash);
    } else {
      throw new Error('Invalid upload type');
    }

    return new Response(
      JSON.stringify({
        success: true,
        ipfsHash: result.IpfsHash,
        cid: result.IpfsHash,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
        pinataUrl: `https://pinata.cloud/ipfs/${result.IpfsHash}`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error uploading to Pinata:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to upload to IPFS',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
