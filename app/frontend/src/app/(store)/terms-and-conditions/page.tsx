import Link from 'next/link';
import { PolicyNav } from '@/components/legal/PolicyNav';
import { ScrollAnimate } from '@/components/ScrollAnimate';

export const metadata = {
  title: 'Terms & Conditions — Dev Creation',
  description: 'Read the official terms and conditions governing the purchase of handcrafted soy wax fragrances and use of the Dev Creation website.',
};

export default function TermsAndConditionsPage() {
  const lastUpdated = 'October 19, 2026';

  return (
    <div className="mx-auto max-w-shell px-[var(--pad)] py-12 lg:py-16">
      <PolicyNav current="/terms-and-conditions" />

      {/* Hero Header */}
      <div className="text-center">
        <ScrollAnimate>
          <span className="util-label mb-2 block">Store Agreement</span>
          <h1 className="font-display-alt text-4xl sm:text-5xl font-medium text-ink">
            Terms & Conditions
          </h1>
        </ScrollAnimate>
        <ScrollAnimate delay={100}>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-ink-3 font-light leading-relaxed">
            Effective & Last Updated: <span className="font-medium text-ink">{lastUpdated}</span> · Dev Creation (devcreation24.in)
          </p>
        </ScrollAnimate>
      </div>

      {/* Main Content */}
      <div className="mt-12 mx-auto max-w-4xl space-y-10 text-xs sm:text-sm leading-relaxed text-body font-light">
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            1. Agreement to Terms
          </h2>
          <p className="mb-3">
            These Terms & Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and <strong>Dev Creation</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), concerning your access to and use of the{' '}
            <Link href="/" className="text-gold-dk underline hover:text-gold">
              https://devcreation24.in
            </Link>{' '}
            website as well as any related media forms or mobile applications.
          </p>
          <p>
            By accessing the website and/or purchasing from our storefront, you agree that you have read, understood, and agree to be bound by all of these Terms. If you do not agree with all of these Terms, you are expressly prohibited from using the site and must discontinue use immediately.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            2. Handcrafted Goods & Natural Variations
          </h2>
          <p className="mb-3">
            Dev Creation specializes in hand-poured luxury soy wax sachets, botanical aroma stones, and candle melts. Each item is produced in small batches by artisan hands using unbleached soy wax and premium fragrance oils.
          </p>
          <p className="mb-3">
            Because our items are handmade, subtle natural variations in color, floral placement, surface texture, and frosting (a natural characteristic of pure soy wax) may occur. These nuances are the mark of authentic artisanal production rather than defects and do not impair scent performance.
          </p>
          <p>
            We strive to display product photography and colors as accurately as possible; however, actual colors may slightly differ depending on your screen display calibration.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            3. Pricing, Taxes & Payment Processing (Razorpay)
          </h2>
          <ul className="list-disc pl-5 space-y-2.5">
            <li>
              <strong>Currency & Taxes:</strong> All prices displayed on our website are in Indian National Rupees (INR ₹) and are inclusive of all applicable goods and service taxes.
            </li>
            <li>
              <strong>Price Changes:</strong> We reserve the right to revise prices for our products at any time without prior notice, provided that accepted orders will be fulfilled at the price active at checkout.
            </li>
            <li>
              <strong>Payment Gateways:</strong> We accept online payments through RBI-authorized payment aggregator <strong>Razorpay</strong>, supporting Unified Payments Interface (UPI), Credit Cards (Visa, MasterCard, RuPay), Debit Cards, and Net Banking. Cash on Delivery (COD) may also be available for serviceable pin codes.
            </li>
            <li>
              <strong>Payment Authorization:</strong> By providing payment details, you represent that you are legally authorized to use the designated payment method. If a payment is declined by your issuing bank or payment gateway, we are not liable for any delay or non-delivery of your order.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            4. Order Acceptance, Modifications & Cancellations
          </h2>
          <p className="mb-3">
            The receipt of an order confirmation does not signify our final acceptance of your order. We reserve the right at any time after receipt of your order to accept, decline, or limit order quantities for reasons including but not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 mb-3">
            <li>Product unavailability or batch curing timelines.</li>
            <li>Inaccuracies or errors in product pricing or descriptions.</li>
            <li>Unserviceable shipping addresses or courier limitations.</li>
            <li>Suspected unauthorized or fraudulent transactions flagged by our fraud detection systems.</li>
          </ul>
          <p>
            If your order is cancelled by us after your payment has been processed, we will promptly issue a full refund to your original payment method in accordance with our{' '}
            <Link href="/refund-policy" className="text-gold-dk underline hover:text-gold">
              Cancellation & Refund Policy
            </Link>.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            5. User Accounts & Responsibilities
          </h2>
          <p className="mb-3">
            When creating an account on Dev Creation, you are responsible for maintaining the confidentiality of your account credentials, login credentials, and phone OTPs. You agree to accept responsibility for all activities that occur under your account.
          </p>
          <p>
            You agree to provide accurate, current, and complete shipping address and contact information so that your orders can be dispatched and delivered without delay.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            6. Intellectual Property Rights
          </h2>
          <p>
            Unless otherwise indicated, the website, source code, designs, photographs, graphics, trademarks, logos, brand names, and fragrance descriptions (&ldquo;Content&rdquo;) are the intellectual property of Dev Creation and protected under copyright and trademark laws of India. No part of the website or Content may be copied, reproduced, aggregated, or republished for commercial use without express prior written permission.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            7. Safe Usage & Care Guidelines
          </h2>
          <p className="mb-3">
            Wax sachets and fragrance melts must be used according to care instructions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Wax sachets are designed for ambient fragrance in enclosed spaces (wardrobes, drawers, closets, vanity areas).</li>
            <li>Keep out of reach of children and pets. Wax sachets and melts are not edible.</li>
            <li>Avoid placing wax sachets in direct intense sunlight or adjacent to high-temperature heating vents (e.g. car dashboards parked in extreme summer heat) as soy wax naturally softens above 48°C.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            8. Limitation of Liability
          </h2>
          <p>
            In no event shall Dev Creation, its founder, artisans, or affiliates be liable for any indirect, consequential, exemplary, incidental, special, or punitive damages arising from your use of the website or our products. Our aggregate liability for any claim arising out of or relating to your purchase shall be strictly limited to the amount paid by you for the specific order under dispute.
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            9. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and defined following the laws of India. Any legal action or dispute arising out of or related to these Terms, orders, or your use of the website shall be subject to the exclusive jurisdiction of the competent courts in <strong>India</strong>.
          </p>
        </section>

        {/* Footer Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-3">
          <p>Have questions regarding these terms? Contact our team.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="font-medium text-ink hover:text-gold underline">
              Contact Concierge →
            </Link>
            <Link href="/refund-policy" className="font-medium text-ink hover:text-gold underline">
              Cancellation & Refund Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
