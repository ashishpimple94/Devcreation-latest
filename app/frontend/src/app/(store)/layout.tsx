import { AnnounceBar } from '@/components/layout/AnnounceBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { CartDrawer } from '@/components/cart/CartDrawer';

/** Shared chrome for the customer-facing storefront. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnounceBar />
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </>
  );
}
