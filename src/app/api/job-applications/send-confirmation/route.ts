import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// POST /api/job-applications/send-confirmation - Send confirmation email to applicant
export async function POST(request: NextRequest) {
  try {
    const { email, jobTitle, applicantName } = await request.json();

    if (!email || !jobTitle || !applicantName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If Resend is configured, send email
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'UCon Ministries Careers <careers@uconministries.org>',
          to: [email],
          subject: `Application Received: ${jobTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>Application Confirmation</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #A92FFA 0%, #F28C28 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0;">UCon Ministries</h1>
                    <p style="color: white; margin: 10px 0 0 0;">Careers</p>
                  </div>
                  
                  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #A92FFA; margin-top: 0;">Application Received!</h2>
                    
                    <p>Dear ${applicantName},</p>
                    
                    <p>Thank you for your interest in the <strong>${jobTitle}</strong> position at UCon Ministries. We have received your application and our team will review it carefully.</p>
                    
                    <div style="background: white; padding: 20px; border-left: 4px solid #F28C28; margin: 20px 0;">
                      <h3 style="margin-top: 0; color: #F28C28;">What's Next?</h3>
                      <ul style="padding-left: 20px;">
                        <li>Our hiring team will review your application within 5 business days</li>
                        <li>If your qualifications match our needs, we'll contact you for an initial interview</li>
                        <li>You'll receive updates via email throughout the process</li>
                      </ul>
                    </div>
                    
                    <p>In the meantime, feel free to explore more about our ministry:</p>
                    <ul style="padding-left: 20px;">
                      <li><a href="https://uconministries.org/about" style="color: #A92FFA;">About Us</a></li>
                      <li><a href="https://uconministries.org/ldi" style="color: #A92FFA;">Leadership Development Institute</a></li>
                      <li><a href="https://uconministries.org/services" style="color: #A92FFA;">Our Services</a></li>
                    </ul>
                    
                    <p>If you have any questions, please don't hesitate to contact us at <a href="mailto:careers@uconministries.org" style="color: #A92FFA;">careers@uconministries.org</a>.</p>
                    
                    <p style="margin-top: 30px;">
                      <strong>Blessings,</strong><br>
                      UCon Ministries Hiring Team
                    </p>
                  </div>
                  
                  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                    <p>UCon Ministries | 2000 S Colorado Blvd T1, Denver, CO 80210</p>
                    <p>© ${new Date().getFullYear()} UCon Ministries. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send confirmation email:', await response.text());
      }
    } else {
      console.log('Resend API key not configured - skipping email');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}
