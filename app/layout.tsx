import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inter } from 'next/font/google';
import type React from 'react';
import './globals.css';

import { ConditionalLayout } from '@/components/ConditionalLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryProvider } from '@/context/QueryProvider';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LostFormed - Lost & Found Phone Reporting System',
  description:
    'Report lost or found phones and find matches automatically with our AI-powered system',
  keywords:
    'lost phone, found phone, phone recovery, lost and found, phone matching',
  authors: [{ name: 'LostFormed Team' }],
  creator: 'LostFormed',
  publisher: 'LostFormed',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://lostformed.com',
    title: 'LostFormed - Lost & Found Phone Reporting System',
    description:
      'Report lost or found phones and find matches automatically with our AI-powered system',
    siteName: 'LostFormed',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LostFormed - Lost & Found Phone Reporting System',
    description:
      'Report lost or found phones and find matches automatically with our AI-powered system',
    creator: '@lostformed',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        {' '}
        <ErrorBoundary>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <div className="min-h-screen bg-background flex flex-col">
                  <ConditionalLayout>{children}</ConditionalLayout>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      className: 'glass-card',
                      style: {
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)',
                      },
                    }}
                  />
                </div>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
