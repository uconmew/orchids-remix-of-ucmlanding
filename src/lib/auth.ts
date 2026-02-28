import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { NextRequest } from 'next/server';
import { headers } from "next/headers"
import { db } from "@/db";
import bcrypt from "bcrypt";
import { resend } from "@/lib/resend";
import { PasswordResetEmail } from "@/emails/password-reset-email";
import { render } from "@react-email/render";
import * as React from "react";
 
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
	emailAndPassword: {    
		enabled: true,
        password: {
            hash: async (password) => {
                return await bcrypt.hash(password, 10);
            },
            verify: async ({ hash, password }) => {
                if (!hash) return false;
                if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
                    return await bcrypt.compare(password, hash);
                }
                return await bcrypt.compare(password, hash);
            }
        },
        sendResetPassword: async ({ user, url }) => {
            // Use void to prevent timing attacks (don't await)
            void (async () => {
                try {
                    if (!process.env.RESEND_API_KEY) {
                        console.error('[PASSWORD RESET] RESEND_API_KEY not configured - cannot send email');
                        return;
                    }
                    
                    const emailHtml = await render(
                        React.createElement(PasswordResetEmail, {
                            userName: user.name || 'User',
                            resetUrl: url,
                        })
                    );
                    
                    const { error } = await resend.emails.send({
                        from: process.env.RESEND_FROM_EMAIL || 'UCon Ministries <noreply@uconministries.org>',
                        to: user.email,
                        subject: '🔐 Reset Your UCon Ministries Password',
                        html: emailHtml,
                    });
                    
                    if (error) {
                        console.error('[PASSWORD RESET] Email send error:', error);
                    } else {
                        console.log(`[PASSWORD RESET] Reset email sent to ${user.email}`);
                    }
                } catch (err) {
                    console.error('[PASSWORD RESET] Error sending email:', err);
                }
            })();
        },
        resetPasswordTokenExpiresIn: 3600, // 1 hour
	},
	session: {
		expiresIn: 7 * 24 * 60 * 60, // 7 days
		updateAge: 24 * 60 * 60,     // 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 7 * 24 * 60 * 60 // 7 days
        }
	},
    advanced: {
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            path: "/"
        }
    },
    trustedOrigins: ["*"]
});

// Session validation helper
// Note: request parameter is kept for backward compatibility but is no longer used
// better-auth requires headers from next/headers, not from NextRequest
export async function getCurrentUser(_request?: NextRequest) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  return session?.user || null;
}