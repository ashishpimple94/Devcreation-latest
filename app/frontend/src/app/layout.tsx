import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'Dev Creation — Luxury Wax Sachets',
  description:
    'Dev Creation crafts luxury wax sachets infused with fine fragrances — handcrafted with love, scented with care.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body text-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
