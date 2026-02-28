import './globals.css';
import { ReactNode } from 'react';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import BackgroundMusic from '@/components/BackgroundMusic';
import PageLoader from '@/components/PageLoader';
import PageTransition from '@/components/PageTransition';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Ucon Ministries | Convicts of Christ',
  description: 'A comprehensive transformation ecosystem for those impacted by addiction and the justice system, meeting individuals at their point of need through healing and transformation.',
  icons: {
    icon: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png',
    shortcut: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png',
    apple: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1000021808-1761356032294.png" sizes="any" />
      </head>
      <body>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="db53bd2f-67cd-4457-a8e9-e3558bf93c9a"
        />
          <ThemeProvider>
            <PageLoader />
            <PageTransition>
              {children}
            </PageTransition>
            <Toaster />
            <BackgroundMusic />
          </ThemeProvider>
      </body>
    </html>
  );
}
