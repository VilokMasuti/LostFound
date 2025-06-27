import { ConditionalLayout } from '@/components/ConditionalLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/context/QueryProvider';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter, Outfit, Poppins } from 'next/font/google';
import type React from 'react';
import { Toaster } from 'sonner';
import './globals.css';
// Modern font combinations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReConnect - Lost & Found Phone Reporting System',
  description: 'Report lost or found phones and find matches automatically with our AI-powered system',
  icons: {
    icon: [
      // REMOVED '/public/' prefix
      { url: '/LOGO-removebg-preview.png', sizes: '192x192', type: 'image/png' },
      { url: '/LOGO-removebg-preview.png', sizes: '32x32', type: 'image/png' },
      { url: '/LOGO-removebg-preview.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/LOGO-removebg-preview.png',
    apple: '/LOGO-removebg-preview.png',
  },
  // ... rest of metadata
  openGraph: {
    // ... other properties
    images: [
      {
        // ADDED absolute path
        url: 'https://lost-found-livid.vercel.app/LOGO-removebg-preview.png',
        width: 1200,
        height: 630,
        alt: 'ReConnect Logo',
      },
    ],
  },
  twitter: {
    // ... other properties
    images: [
      // ADDED absolute path
      'https://lost-found-livid.vercel.app/LOGO-removebg-preview.png'
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${outfit.variable} font-poppins antialiased`}
        style={{
          fontFeatureSettings: '"cv11", "ss01"',
          fontVariationSettings: '"opsz" 32',
        }}
      >
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex flex-col">
                <ConditionalLayout>{children}</ConditionalLayout>
                <Analytics />
                <Toaster
                  position="top-right"
                  expand={true}
                  richColors
                  closeButton
                  toastOptions={{
                    className: 'modern-toast',
                    style: {
                      background: 'rgba(0, 0, 0, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: 'white',
                      fontFamily: 'var(--font-poppins)',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow:
                        '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                />
              </div>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
