import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Cormorant_Garamond, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-dmsans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const viewport: Viewport = {
  themeColor: '#FAF7F2',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://devcreation24.in'),
  title: {
    default: 'Dev Creation — Luxury Handcrafted Soy Wax Sachets & Home Fragrances',
    template: '%s | Dev Creation',
  },
  description:
    'Dev Creation crafts luxury artisanal soy wax sachets, wax melts, and aroma stones in India. Infused with 100% pure soy wax and IFRA-certified fine fragrance oils to naturally elevate your wardrobe, linens, and living spaces.',
  keywords: [
    'luxury wax sachets',
    'soy wax sachets india',
    'wardrobe freshener',
    'closet air freshener',
    'artisanal wax melts',
    'aroma stones',
    'natural home fragrance',
    'handcrafted scented wax',
    'luxury fragrance gifts',
    'Dev Creation Pune',
    'dev creation',
    'devcreation24',
  ],
  authors: [{ name: 'Dev Creation', url: 'https://devcreation24.in' }],
  creator: 'Dev Creation',
  publisher: 'Dev Creation',
  alternates: {
    canonical: 'https://devcreation24.in',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://devcreation24.in',
    siteName: 'Dev Creation',
    title: 'Dev Creation — Luxury Handcrafted Soy Wax Sachets & Home Fragrances',
    description:
      'Elevate your living spaces with artisanal 100% pure soy wax sachets, delicate melts, and botanical aroma stones. Handcrafted in India.',
    images: [
      {
        url: '/assets/Logos/Logo2.png',
        width: 800,
        height: 800,
        alt: 'Dev Creation Artisanal Luxury Fragrance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dev Creation — Luxury Handcrafted Soy Wax Sachets & Home Fragrances',
    description:
      'Artisanal soy wax sachets, wax melts, and home fragrances handcrafted in India.',
    images: ['/assets/Logos/Logo2.png'],
  },
  verification: {
    google: 'googled17d0ed782cf7993',
    other: {
      'google-site-verification': [
        'googled17d0ed782cf7993.html',
        'googled17d0ed782cf7993',
      ],
    },
  },
  icons: {
    icon: '/assets/Logos/Logo2.png',
    apple: '/assets/Logos/Logo2.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://devcreation24.in/#organization',
      name: 'Dev Creation',
      url: 'https://devcreation24.in',
      logo: 'https://devcreation24.in/assets/Logos/Logo2.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-788-758-2008',
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['English', 'Hindi', 'Marathi'],
        email: 'support@devcreation24.in',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://devcreation24.in/#website',
      url: 'https://devcreation24.in',
      name: 'Dev Creation',
      description: 'Luxury Handcrafted Soy Wax Sachets & Home Fragrances',
      publisher: {
        '@id': 'https://devcreation24.in/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://devcreation24.in/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Store',
      '@id': 'https://devcreation24.in/#store',
      name: 'Dev Creation',
      url: 'https://devcreation24.in',
      image: 'https://devcreation24.in/assets/Logos/Logo2.png',
      priceRange: '₹₹',
      telephone: '+91-788-758-2008',
      email: 'support@devcreation24.in',
      currenciesAccepted: 'INR',
      paymentAccepted: 'Cash, Credit Card, UPI, Net Banking',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="preload" as="image" href="/assets/image1.jpg" fetchPriority="high" />
      </head>
      <body className="font-body text-body antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
