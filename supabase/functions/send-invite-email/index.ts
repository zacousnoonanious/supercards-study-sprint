
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  inviteToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, lastName, organizationName, inviteToken }: InviteEmailRequest = await req.json();

    // Get the site URL from environment or use a default
    const siteUrl = Deno.env.get("SITE_URL") || "https://your-app.lovable.app";
    const inviteUrl = `${siteUrl}/auth?invite=${inviteToken}`;

    const emailResponse = await resend.emails.send({
      from: "SuperCards <onboarding@resend.dev>",
      to: [email],
      subject: `You're invited to join ${organizationName} on SuperCards`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Join ${organizationName} on SuperCards</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📚 SuperCards</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #2d3748; margin-top: 0;">Hi ${firstName},</h2>
              
              <p style="margin-bottom: 20px;">You've been invited to join <strong>${organizationName}</strong> on SuperCards! SuperCards is a powerful platform for creating and studying interactive flashcards.</p>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #2d3748;">What you can do with SuperCards:</h3>
                <ul style="margin: 0;">
                  <li>Create interactive flashcard sets</li>
                  <li>Collaborate with your team</li>
                  <li>Study with advanced learning modes</li>
                  <li>Track your progress and performance</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                  Accept Invitation & Sign Up
                </a>
              </div>
              
              <p style="color: #718096; font-size: 14px; margin-bottom: 10px;">
                <strong>Note:</strong> This invitation will expire in 7 days.
              </p>
              
              <p style="color: #718096; font-size: 14px;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #667eea; word-break: break-all;">${inviteUrl}</a>
              </p>
              
              <hr style="border: none; border-top: 1px solid #e1e5e9; margin: 30px 0;">
              
              <p style="color: #718096; font-size: 12px; text-align: center; margin: 0;">
                This invitation was sent by ${organizationName}. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Invite email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invite-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
