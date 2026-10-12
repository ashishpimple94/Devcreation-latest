import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { PageTransition } from '@/components/layout/PageTransition';

/** Shared chrome for the customer-facing storefront. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="min-h-[60vh] overflow-hidden">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <WhatsAppFloat />
      <CartDrawer />
    </>
  );
}
