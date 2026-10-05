import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'Dev Creation — Admin',
  description: 'Dev Creation admin panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full w-full"
    >
      <body className="h-full w-full font-body text-ink antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
