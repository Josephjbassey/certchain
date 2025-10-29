import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CLOUDFLARE_API_TOKEN = Deno.env.get("CLOUDFLARE_API_TOKEN");
const CLOUDFLARE_ACCOUNT_ID = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
const NOTIFICATION_EMAIL = Deno.env.get("NOTIFICATION_EMAIL") || "support@certchain.app";

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

    // Store contact form submission in database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        subject,
        message,
        submitted_at: new Date().toISOString()
      });

    if (dbError) {
      console.error("Error storing contact submission:", dbError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to submit contact form",
          details: dbError.message
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Successfully stored - you can view submissions in Supabase dashboard
    // or set up Cloudflare Email Worker to send notifications
    console.log("Contact form submission stored successfully");

    // Send email notification via Cloudflare Email Routing API (if configured)
    if (CLOUDFLARE_API_TOKEN && CLOUDFLARE_ACCOUNT_ID) {
      try {
        const emailBody = `
New Contact Form Submission

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Submitted at: ${new Date().toISOString()}
View in dashboard: ${SUPABASE_URL}
        `.trim();

        // Send email using Cloudflare Email Routing API
        const emailResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/email/routing/addresses/${NOTIFICATION_EMAIL}/send`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: `noreply@certchain.app`,
              to: NOTIFICATION_EMAIL,
              subject: `Contact Form: ${subject}`,
              text: emailBody,
              reply_to: email
            })
          }
        );

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error('Cloudflare email send failed:', errorText);
          // Don't fail the whole request if email fails
        } else {
          console.log('Email notification sent via Cloudflare');
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the whole request if email fails
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Contact form submitted successfully"
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
