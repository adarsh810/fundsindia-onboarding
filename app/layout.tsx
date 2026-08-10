import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const dmSans   = DM_Sans({ subsets: ['latin'], variable: '--font-dm', display: 'swap' });

export const metadata: Metadata = {
  title: 'Gyaan — 8-week onboarding',
  description: '144 hours · 8 weeks · 32 topics — FundsIndia PM onboarding tracker',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Gyaan' },
  icons: { apple: '/icons/icon-192.png' },
};

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="min-h-screen bg-[#FAF8F5]">
        {children}
        <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')` }} />
      </body>
    </html>
  );
}
