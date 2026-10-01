import type { Metadata } from 'next';
import { Playfair_Display, Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-playfair', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-cormorant', display: 'swap' });
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-dmsans', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-jetbrains', display: 'swap' });

export const metadata: Metadata = {
  title: 'Dev Creation — Admin',
  description: 'Dev Creation admin panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full w-full ${playfair.variable} ${cormorant.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="h-full w-full font-body text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
