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

    const { certificateData, fileData, type = 'metadata', data, name } = await req.json();

    console.log('Uploading to Pinata/IPFS:', type);

    let result;

    if (type === 'metadata') {
      // Support both old 'data' field and new 'certificateData' field for backward compatibility
      const metadataToUpload = certificateData || data;

      if (!metadataToUpload) {
        throw new Error('certificateData or data is required for metadata upload');
      }

      // If it's already a complete metadata object, use it directly
      let metadata;
      if (metadataToUpload.attributes || metadataToUpload.properties) {
        // Already formatted metadata
        metadata = metadataToUpload;
      } else if (metadataToUpload.certificateId) {
        // Certificate data format - convert to NFT metadata
        metadata = {
          name: metadataToUpload.courseName || 'Certificate',
          description: metadataToUpload.recipientEmail
            ? `Certificate issued to ${metadataToUpload.recipientEmail}`
            : `Certificate issued by ${metadataToUpload.institutionName || 'Institution'}`,
          image: metadataToUpload.imageUrl || '',
          attributes: [
            { trait_type: 'Recipient', value: metadataToUpload.recipientEmail || metadataToUpload.recipientName || 'N/A' },
            { trait_type: 'Course', value: metadataToUpload.courseName },
            { trait_type: 'Institution', value: metadataToUpload.institutionName || 'N/A' },
            { trait_type: 'Issuer DID', value: metadataToUpload.issuerDid },
            { trait_type: 'Recipient DID', value: metadataToUpload.recipientDid || 'N/A' },
            { trait_type: 'Issued At', value: new Date(metadataToUpload.issuedAt).toISOString() },
            {
              trait_type: 'Expires At',
              value: metadataToUpload.expiresAt
                ? new Date(metadataToUpload.expiresAt).toISOString()
                : 'Never',
            },
          ],
          properties: {
            certificateId: metadataToUpload.certificateId,
            institutionId: metadataToUpload.institutionId,
            courseName: metadataToUpload.courseName,
            skills: metadataToUpload.skills || [],
          },
        };
      } else {
        // Simple data object - upload as-is
        metadata = metadataToUpload;
      }

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
      if (!fileData) {
        throw new Error('fileData is required for file upload');
      }

      // Upload file using multipart form data
      const formData = new FormData();

      // Decode base64 content if needed
      let fileContent;
      if (typeof fileData.content === 'string') {
        // Assume base64 encoded
        const binaryString = atob(fileData.content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        fileContent = bytes;
      } else {
        fileContent = fileData.content;
      }

      const blob = new Blob([fileContent], { type: fileData.mimetype || 'application/octet-stream' });
      formData.append('file', blob, fileData.filename);
      
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
