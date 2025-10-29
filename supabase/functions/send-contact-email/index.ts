import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactFormRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
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

    // Prepare email HTML
    const emailBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #4b5563;
              margin-bottom: 5px;
              display: block;
            }
            .field-value {
              background: white;
              padding: 12px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            .message-box {
              background: white;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer {
              margin-top: 20px;
              padding: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .reply-button {
              display: inline-block;
              margin-top: 15px;
              padding: 12px 24px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📩 New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">CertChain Contact Form</p>
          </div>
          
          <div class="content">
            <div class="field">
              <span class="field-label">From:</span>
              <div class="field-value">${name}</div>
            </div>
            
            <div class="field">
              <span class="field-label">Email:</span>
              <div class="field-value">
                <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
              </div>
            </div>
            
            <div class="field">
              <span class="field-label">Subject:</span>
              <div class="field-value">${subject}</div>
            </div>
            
            <div class="field">
              <span class="field-label">Message:</span>
              <div class="message-box">${message}</div>
            </div>
            
            <div style="text-align: center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="reply-button">
                Reply to ${name}
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>This message was sent via the CertChain contact form at certchain.app</p>
            <p style="margin-top: 10px;">
              <strong>CertChain</strong><br>
              4 Fadogba Street, Ifelodun Estate<br>
              Akure, Ondo State 340110, Nigeria
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CertChain Contact Form <noreply@certchain.app>",
        to: ["support@certchain.app"],
        reply_to: email,
        subject: `Contact Form: ${subject}`,
        html: emailBody,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send email",
          details: resendData
        }),
        { 
          status: resendResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("Contact form email sent successfully:", resendData);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email sent successfully",
        emailId: resendData.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
