import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface InvitationEmailRequest {
  to: string;
  subject: string;
  invitationLink: string;
  role: string;
  institutionName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, invitationLink, role, institutionName }: InvitationEmailRequest = await req.json();

    // Validate required fields
    if (!to || !invitationLink || !role || !institutionName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check if Resend API key is configured
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ 
          error: "Email service not configured",
          details: "RESEND_API_KEY environment variable is missing"
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

  const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation to ${institutionName}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CertChain Invitation</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">You're invited to join ${institutionName}!</h2>
            
            <p style="font-size: 16px; color: #4b5563;">
              You've been invited to become a <strong>${role}</strong> at ${institutionName} on CertChain, 
              the decentralized certificate verification platform powered by Hedera blockchain.
            </p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${invitationLink}" 
                 style="background: #8B5CF6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                Accept Invitation
              </a>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⏰ This invitation expires in 7 days.</strong>
              </p>
            </div>
            
            <h3 style="color: #1f2937; margin-top: 30px;">What you can do:</h3>
            <ul style="color: #4b5563; padding-left: 20px;">
              <li>Issue blockchain-verified certificates</li>
              <li>Manage recipient credentials</li>
              <li>Track certificate issuance and verification</li>
              <li>Access institutional dashboard and analytics</li>
            </ul>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 13px; color: #6b7280; margin: 0;">
              If you didn't expect this invitation or have questions, please contact ${institutionName} directly.
              You can safely ignore this email if you're not interested.
            </p>
            
            <p style="font-size: 13px; color: #9ca3af; margin-top: 20px; text-align: center;">
              © 2025 CertChain. Powered by Hedera Hashgraph.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend API
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CertChain <noreply@certchain.app>",
      to: [to],
      subject: subject,
      html: emailBody,
    }),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});