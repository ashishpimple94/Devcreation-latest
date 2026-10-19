import Link from 'next/link';
import { PolicyNav } from '@/components/legal/PolicyNav';
import { ScrollAnimate } from '@/components/ScrollAnimate';

export const metadata = {
  title: 'Shipping & Delivery Policy — Dev Creation',
  description: 'Learn about our pan-India shipping timelines, courier partners, free shipping terms, and order tracking process at Dev Creation.',
};

export default function ShippingPolicyPage() {
  const lastUpdated = 'October 19, 2026';

  return (
    <div className="mx-auto max-w-shell px-[var(--pad)] py-12 lg:py-16">
      <PolicyNav current="/shipping-policy" />

      {/* Hero Header */}
      <div className="text-center">
        <ScrollAnimate>
          <span className="util-label mb-2 block">Pan-India Express</span>
          <h1 className="font-display-alt text-4xl sm:text-5xl font-medium text-ink">
            Shipping & Delivery Policy
          </h1>
        </ScrollAnimate>
        <ScrollAnimate delay={100}>
          <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-ink-3 font-light leading-relaxed">
            Effective & Last Updated: <span className="font-medium text-ink">{lastUpdated}</span> · Dev Creation (devcreation24.in)
          </p>
        </ScrollAnimate>
      </div>

      {/* Highlights */}
      <div className="mt-10 mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl border border-gold/30 bg-surface p-5 shadow-2xs">
          <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper block mb-1">
            Free Shipping Threshold
          </span>
          <p className="font-display text-lg font-medium text-gold-dk">Orders Above ₹999</p>
          <p className="text-[0.72rem] text-body mt-1">Automatic zero delivery charge</p>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-surface p-5 shadow-2xs">
          <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper block mb-1">
            Handcrafting & Curing
          </span>
          <p className="font-display text-lg font-medium text-ink">1 to 2 Business Days</p>
          <p className="text-[0.72rem] text-body mt-1">Small batch quality control</p>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-surface p-5 shadow-2xs">
          <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper block mb-1">
            Delivery Timeline
          </span>
          <p className="font-display text-lg font-medium text-ink">3 to 7 Business Days</p>
          <p className="text-[0.72rem] text-body mt-1">Express pan-India delivery</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-10 mx-auto max-w-4xl space-y-10 text-xs sm:text-sm leading-relaxed text-body font-light">
        {/* Coverage */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            1. Pan-India Delivery Coverage
          </h2>
          <p className="mb-3">
            Dev Creation happily delivers handcrafted home fragrances to customers across India. We service over <strong>26,000+ postal pin codes</strong> spanning all states and union territories via India&apos;s leading surface and air courier networks, including <strong>Delhivery, BlueDart, DTDC, and Xpressbees</strong>.
          </p>
          <p>
            At this time, we fulfill orders within the domestic territory of India. International delivery inquiries can be coordinated on a bespoke basis via our concierge desk.
          </p>
        </section>

        {/* Processing & Dispatch */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            2. Processing & Studio Preparation Time
          </h2>
          <p className="mb-3">
            Because our wax sachets and botanical aroma pieces are hand-poured in artisanal small batches using 100% natural soy wax, items undergo careful curing and inspection:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Standard Processing:</strong> Orders are prepared, sealed, and handed over to our courier partners within <strong>1 to 2 business days</strong> (Monday through Saturday, excluding national holidays).
            </li>
            <li>
              <strong>Bespoke / Custom Gifting Orders:</strong> Custom gift hampers or personalized wax favor orders require 3 to 5 business days for tailored production, as agreed during concierge consultation.
            </li>
          </ul>
        </section>

        {/* Shipping Rates */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            3. Shipping Charges
          </h2>
          <div className="overflow-hidden rounded-xl border border-line mt-4">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 font-util uppercase tracking-wider text-copper border-b border-line">
                <tr>
                  <th className="p-3.5 sm:p-4">Order Value</th>
                  <th className="p-3.5 sm:p-4">Delivery Mode</th>
                  <th className="p-3.5 sm:p-4 text-right">Shipping Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-2">
                <tr className="bg-white">
                  <td className="p-3.5 sm:p-4 font-medium text-ink">Orders ₹999 and above</td>
                  <td className="p-3.5 sm:p-4">Express Pan-India</td>
                  <td className="p-3.5 sm:p-4 text-right font-bold text-emerald-700">FREE</td>
                </tr>
                <tr className="bg-surface-2/40">
                  <td className="p-3.5 sm:p-4 font-medium text-ink">Orders under ₹999</td>
                  <td className="p-3.5 sm:p-4">Standard Express Courier</td>
                  <td className="p-3.5 sm:p-4 text-right font-medium">₹60 – ₹80 (Calculated at checkout)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Estimated Delivery Timelines */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            4. Estimated Transit & Delivery Timelines
          </h2>
          <p className="mb-4">
            Once dispatched from our studio in Maharashtra, the estimated delivery timelines are:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
              <h4 className="font-medium text-ink text-sm mb-1">🌆 Tier-1 & Metro Cities</h4>
              <p className="text-xs text-body leading-relaxed">
                Mumbai, Pune, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata: <strong>3 to 5 business days</strong>.
              </p>
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
              <h4 className="font-medium text-ink text-sm mb-1">🏙️ Tier-2 & Regional Hubs</h4>
              <p className="text-xs text-body leading-relaxed">
                State capitals and major district towns: <strong>4 to 7 business days</strong>.
              </p>
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
              <h4 className="font-medium text-ink text-sm mb-1">🏞️ Remote & Special Areas</h4>
              <p className="text-xs text-body leading-relaxed">
                North-East states, Jammu & Kashmir, island territories: <strong>7 to 10 business days</strong>.
              </p>
            </div>
          </div>
          <p className="mt-3 text-[0.74rem] text-ink-3">
            *Note: Delivery times may be slightly extended during national festive seasons (e.g. Diwali) or extreme weather conditions.
          </p>
        </section>

        {/* Tracking */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            5. Order Tracking
          </h2>
          <p className="mb-3">
            As soon as your package is dispatched, we transmit an automated notification to your registered mobile number and email containing:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The name of the assigned courier partner (e.g. Delhivery).</li>
            <li>Your unique Air Waybill (AWB) tracking number.</li>
            <li>A live direct tracking link to follow your parcel from studio to your door.</li>
          </ul>
        </section>

        {/* Non-Delivery */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            6. Address Accuracy & Unsuccessful Deliveries
          </h2>
          <p className="mb-3">
            Our courier partners attempt delivery up to 3 times before returning the parcel to our studio. Please ensure your shipping address includes complete details (flat/house number, building, street, landmark, city, state, and correct 6-digit pin code) along with an active reachable mobile number.
          </p>
          <p>
            If a parcel is returned to us due to an incorrect or incomplete address provided by the customer, our concierge will contact you to coordinate re-shipping upon receipt of the corrected details.
          </p>
        </section>

        {/* Footer Contact */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-3">
          <p>Questions about shipping or custom delivery requirements?</p>
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
