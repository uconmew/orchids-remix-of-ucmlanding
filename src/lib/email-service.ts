import { resend } from '@/lib/resend';
import { WelcomeStaffEmail } from '@/emails/welcome-staff-email';
import pLimit from 'p-limit';
import * as React from 'react';

// Rate limiter: 2 requests per second (Resend limit)
const limiter = pLimit(1);

interface SendEmailOptions {
  to: string;
  subject: string;
  react: React.ReactElement;
  replyTo?: string;
}

interface EmailServiceResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<EmailServiceResponse> {
  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - email sending disabled');
    return {
      success: false,
      error: 'Email service not configured',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'UCon Ministries <noreply@uconministries.org>',
      to: options.to,
      subject: options.subject,
      react: options.react,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Email service error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendWelcomeStaffEmail(
  userName: string,
  userEmail: string,
  registrationNumber: string,
  temporaryPassword: string,
  roleName: string,
  staffTitle: string | undefined,
  loginUrl: string
): Promise<EmailServiceResponse> {
  return limiter(() =>
    sendEmail({
      to: userEmail,
      subject: '🎉 Welcome to UCon Ministries - Your Staff Account is Ready',
      react: React.createElement(WelcomeStaffEmail, {
        userName,
        userEmail,
        registrationNumber,
        temporaryPassword,
        roleName,
        staffTitle,
        loginUrl,
      }),
    })
  );
}
