import Link from 'next/link';
import { PolicyNav } from '@/components/legal/PolicyNav';
import { ScrollAnimate } from '@/components/ScrollAnimate';

export const metadata = {
  title: 'Cancellation & Refund Policy — Dev Creation',
  description: 'Official return, cancellation, and refund timelines for handcrafted wax fragrances purchased from Dev Creation in compliance with Indian consumer guidelines.',
};

export default function RefundPolicyPage() {
  const lastUpdated = 'October 19, 2026';

  return (
    <div className="mx-auto max-w-shell px-[var(--pad)] py-12 lg:py-16">
      <PolicyNav current="/refund-policy" />

      {/* Hero Header */}
      <div className="text-center">
        <ScrollAnimate>
          <span className="util-label mb-2 block">Customer Assurance</span>
          <h1 className="font-display-alt text-4xl sm:text-5xl font-medium text-ink">
            Cancellation & Refund Policy
          </h1>
        </ScrollAnimate>
        <ScrollAnimate delay={100}>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-ink-3 font-light leading-relaxed">
            Effective & Last Updated: <span className="font-medium text-ink">{lastUpdated}</span> · Dev Creation (devcreation24.in)
          </p>
        </ScrollAnimate>
      </div>

      {/* Key Highlights Banner */}
      <div className="mt-10 mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl border border-gold/30 bg-surface p-5 shadow-2xs">
          <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper block mb-1">
            Cancellation Window
          </span>
          <p className="font-display text-lg font-medium text-ink">Within 12 Hours</p>
          <p className="text-[0.72rem] text-body mt-1">Or prior to package courier dispatch</p>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-surface p-5 shadow-2xs">
          <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper block mb-1">
            Damaged / Defect Claim
          </span>
          <p className="font-display text-lg font-medium text-ink">Within 48 Hours</p>
          <p className="text-[0.72rem] text-body mt-1">Free replacement or full refund</p>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-surface p-5 shadow-2xs">
          <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper block mb-1">
            Refund Timeline
          </span>
          <p className="font-display text-lg font-medium text-gold-dk">5 to 7 Business Days</p>
          <p className="text-[0.72rem] text-body mt-1">Direct to original payment method</p>
        </div>
      </div>

      {/* Detailed Content */}
      <div className="mt-10 mx-auto max-w-4xl space-y-10 text-xs sm:text-sm leading-relaxed text-body font-light">
        {/* Section 1: Cancellations */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            1. Order Cancellation Policy
          </h2>
          <p className="mb-3">
            At Dev Creation, each batch of wax sachets and home fragrances is hand-poured, cured, and packaged with extreme care. We understand plans may change, and we offer hassle-free cancellations under the following terms:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Before Dispatch (Within 12 Hours):</strong> You may cancel your order within 12 hours of placing it or anytime before our studio hands the package over to our logistics partner. To cancel, please message us on WhatsApp at{' '}
              <a href="https://wa.me/917887582008" target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-700 underline">
                +91 788 758 2008
              </a>{' '}
              or email{' '}
              <a href="mailto:support@devcreation24.in" className="font-medium text-gold-dk underline">
                support@devcreation24.in
              </a>{' '}
              with your Order ID (e.g. DC-10842).
            </li>
            <li>
              <strong>After Dispatch:</strong> Once your parcel has been handed over to the courier partner and an Air Waybill (AWB) tracking number has been generated, the shipment cannot be intercepted or cancelled in transit. You may instead initiate a return upon receipt according to our Return Guidelines below.
            </li>
          </ul>
        </section>

        {/* Section 2: Returns & Replacements */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            2. Returns & Replacement Guidelines
          </h2>
          <p className="mb-3">
            We want you to love your fragrance experience. If you are not satisfied with your purchase, you may request a return within <strong>14 days of delivery</strong>:
          </p>
          <div className="rounded-xl border border-line-soft bg-surface-2 p-4 mb-4">
            <h4 className="font-medium text-ink text-xs uppercase tracking-wider mb-1.5 font-util">
              Return Eligibility Criteria:
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-body">
              <li>Item must be unused, unburned, and in the same pristine condition in which you received it.</li>
              <li>Item must be enclosed in its original branded protective box, with ribbons, seals, and tags intact.</li>
              <li>Due to the personal and aromatic nature of wax sachets and home fragrances, opened or used items cannot be returned for hygiene and scent integrity reasons.</li>
            </ul>
          </div>
          <p>
            Customized wedding favors, bespoke corporate batches, and purchased digital gift cards are non-returnable unless defective.
          </p>
        </section>

        {/* Section 3: Damaged, Defective or Incorrect Items */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            3. Damaged, Defective or Incorrect Items Received
          </h2>
          <p className="mb-3">
            Every shipment is wrapped in multiple layers of protective packaging to ensure safe transit across India. In the rare event that your item arrives broken, damaged in transit, or missing an item:
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>
              Notify our team within <strong>48 hours of delivery</strong> by emailing{' '}
              <a href="mailto:support@devcreation24.in" className="font-medium text-gold-dk underline">
                support@devcreation24.in
              </a>{' '}
              or via WhatsApp at{' '}
              <a href="https://wa.me/917887582008" className="font-medium text-emerald-700 underline">
                +91 788 758 2008
              </a>.
            </li>
            <li>
              Share your Order ID along with clear photographs or a short video showing the damage and the outer packaging.
            </li>
            <li>
              Upon verification, we will immediately dispatch a <strong>free brand-new replacement</strong> at zero additional cost, or issue a <strong>100% full refund</strong> (including any shipping charges paid), based entirely on your preference.
            </li>
          </ol>
        </section>

        {/* Section 4: Refund Processing & Razorpay Timelines */}
        <section className="rounded-2xl border border-gold/40 bg-surface p-7 sm:p-9 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-copper">
              Razorpay & Banking Compliance
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            4. Refund Processing Time & Method
          </h2>
          <p className="mb-4">
            Once your return is received at our studio and inspected, or your cancellation request is approved, our finance desk initiates your refund immediately:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-line bg-surface-2 p-5">
              <h4 className="font-medium text-ink text-sm mb-1.5 flex items-center gap-2">
                💳 Online Payments (UPI, Cards, NetBanking)
              </h4>
              <p className="text-xs text-body leading-relaxed mb-2">
                Refunds are initiated through our payment gateway (<strong>Razorpay</strong>) within 24 to 48 hours of approval.
              </p>
              <div className="rounded-lg bg-white border border-gold/30 p-2.5 font-util text-[0.7rem] text-gold-dk font-semibold">
                Credited to original source account within 5 to 7 business days (subject to issuing bank clearing cycles).
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface-2 p-5">
              <h4 className="font-medium text-ink text-sm mb-1.5 flex items-center gap-2">
                💵 Cash on Delivery (COD) Orders
              </h4>
              <p className="text-xs text-body leading-relaxed mb-2">
                For eligible COD cancellations or returns, our team will request your verified bank account details (Account Number, IFSC, Account Holder Name) or UPI VPA.
              </p>
              <div className="rounded-lg bg-white border border-gold/30 p-2.5 font-util text-[0.7rem] text-ink-2 font-semibold">
                Transferred via NEFT / IMPS / UPI within 3 to 5 business days after bank verification.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Late or Missing Refunds */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            5. Late or Missing Refunds
          </h2>
          <p className="mb-3">
            If you have not received your refund after 7 business days from our confirmation email:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Check your bank statement or credit card account again.</li>
            <li>Contact your bank or card issuer, as there is often an official clearing period before a refund is officially posted.</li>
            <li>If you have checked and still have not received your refund, please reach out to us at{' '}
              <a href="mailto:support@devcreation24.in" className="font-medium text-gold-dk underline">
                support@devcreation24.in
              </a>{' '}
              with your Order ID and we will provide the Razorpay Refund Reference Number (RRN) to trace with your bank.
            </li>
          </ul>
        </section>

        {/* Footer Contact */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-3">
          <p>Need assistance with a return or refund? Our concierge is on standby.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="font-medium text-ink hover:text-gold underline">
              Contact Concierge →
            </Link>
            <Link href="/shipping-policy" className="font-medium text-ink hover:text-gold underline">
              Shipping & Delivery Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
