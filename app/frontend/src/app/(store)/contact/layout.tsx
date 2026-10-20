import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — Customer Concierge & Studio Support',
  description:
    'Get in touch with Dev Creation. Contact our fragrance concierge for order inquiries, custom gifting, corporate collaborations, or wholesale partnerships.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
