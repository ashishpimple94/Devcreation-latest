import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <span className="font-util text-[0.6rem] uppercase tracking-[0.2em] text-copper">Support &amp; Documentation</span>
        <h1 className="mt-1 font-display-alt text-3xl font-medium text-ink">Help Center</h1>
        <p className="mt-1 text-sm text-ink-3">Guides, operational support, and quick access for store managers.</p>
      </div>

      {/* Support Contact Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dk">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h2 className="font-display-alt text-lg font-medium text-ink">Email Support</h2>
          <p className="mt-1 text-xs text-ink-3">Direct help for technical queries, order discrepancies, or account issues.</p>
          <a
            href="mailto:support@devcreation24.in"
            className="mt-4 inline-block font-util text-xs font-semibold uppercase tracking-wider text-copper hover:text-gold"
          >
            support@devcreation24.in &rarr;
          </a>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
          <h2 className="font-display-alt text-lg font-medium text-ink">WhatsApp Concierge</h2>
          <p className="mt-1 text-xs text-ink-3">Instant team chat for urgent order updates and customer queries.</p>
          <a
            href="https://wa.me/917887582008"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-util text-xs font-semibold uppercase tracking-wider text-emerald-700 hover:text-emerald-800"
          >
            +91 7887582008 &rarr;
          </a>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <h2 className="font-display-alt text-lg font-medium text-ink">Live Storefront</h2>
          <p className="mt-1 text-xs text-ink-3">Verify product displays, live inventory pricing, and customer checkout flows.</p>
          <a
            href="https://devcreation24.in"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-util text-xs font-semibold uppercase tracking-wider text-copper hover:text-gold"
          >
            devcreation24.in ↗
          </a>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h2 className="font-display-alt text-xl font-medium text-ink">Quick Management Shortcuts</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/orders"
            className="group rounded-xl border border-line-soft bg-surface-2 p-4 transition-all hover:border-gold hover:bg-gold/5"
          >
            <h3 className="text-sm font-semibold text-ink group-hover:text-gold-dk">Orders &amp; Invoices</h3>
            <p className="mt-1 text-xs text-ink-3">Track fulfillment, update tracking IDs, generate invoices.</p>
          </Link>

          <Link
            href="/products"
            className="group rounded-xl border border-line-soft bg-surface-2 p-4 transition-all hover:border-gold hover:bg-gold/5"
          >
            <h3 className="text-sm font-semibold text-ink group-hover:text-gold-dk">Product Catalog</h3>
            <p className="mt-1 text-xs text-ink-3">Create luxury items, upload images, manage prices and variants.</p>
          </Link>

          <Link
            href="/inventory"
            className="group rounded-xl border border-line-soft bg-surface-2 p-4 transition-all hover:border-gold hover:bg-gold/5"
          >
            <h3 className="text-sm font-semibold text-ink group-hover:text-gold-dk">Stock &amp; Inventory</h3>
            <p className="mt-1 text-xs text-ink-3">Monitor low-stock items and refill stock alerts.</p>
          </Link>

          <Link
            href="/gift-cards"
            className="group rounded-xl border border-line-soft bg-surface-2 p-4 transition-all hover:border-gold hover:bg-gold/5"
          >
            <h3 className="text-sm font-semibold text-ink group-hover:text-gold-dk">Gift Cards &amp; Coupons</h3>
            <p className="mt-1 text-xs text-ink-3">Create promo codes, flat discounts, and percentage vouchers.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
