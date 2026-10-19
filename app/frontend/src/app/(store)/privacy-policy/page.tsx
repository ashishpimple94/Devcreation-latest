import Link from 'next/link';
import { PolicyNav } from '@/components/legal/PolicyNav';
import { ScrollAnimate } from '@/components/ScrollAnimate';

export const metadata = {
  title: 'Privacy Policy — Dev Creation',
  description: 'Learn how Dev Creation collects, protects, and handles your personal information in compliance with Indian privacy laws and payment security standards.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 19, 2026';

  return (
    <div className="mx-auto max-w-shell px-[var(--pad)] py-12 lg:py-16">
      <PolicyNav current="/privacy-policy" />

      {/* Hero Header */}
      <div className="text-center">
        <ScrollAnimate>
          <span className="util-label mb-2 block">Customer Trust & Compliance</span>
          <h1 className="font-display-alt text-4xl sm:text-5xl font-medium text-ink">
            Privacy Policy
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
        {/* Introduction */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            1. Overview & Commitment to Your Privacy
          </h2>
          <p className="mb-3">
            Welcome to <strong>Dev Creation</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;, operating through the website{' '}
            <Link href="/" className="text-gold-dk underline hover:text-gold">
              https://devcreation24.in
            </Link>
            ). We craft artisanal soy wax sachets and home fragrances in India and are dedicated to maintaining the trust and confidence of every customer who visits our shop.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, store, process, and safeguard your personal information when you browse our shop, create an account, purchase products, or interact with our customer concierge. This policy adheres to the <em>Information Technology Act, 2000</em>, the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</em>, and the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em> of India.
          </p>
        </section>

        {/* Data Collection */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            2. Information We Collect
          </h2>
          <p className="mb-4">
            We only collect information necessary to fulfill your orders, provide dedicated customer support, and offer a seamless shopping experience:
          </p>
          <ul className="list-disc pl-5 space-y-2.5">
            <li>
              <strong className="text-ink font-medium">Personal Identification Details:</strong> When you register, complete your profile, or place an order, we collect your full name, email address, mobile phone number, shipping address, and billing address.
            </li>
            <li>
              <strong className="text-ink font-medium">Order & Purchase History:</strong> Details of products ordered, scent variants selected, gift card redemptions, order totals, and fulfillment status.
            </li>
            <li>
              <strong className="text-ink font-medium">Payment & Transaction Data (Razorpay):</strong> We facilitate payments through RBI-authorized payment aggregators, specifically <strong>Razorpay Software Private Limited</strong>. When you complete an order, Razorpay securely processes your payment. We store solely non-sensitive transaction identifiers (such as Razorpay Order ID, Payment ID, payment method used, and payment status).
              <div className="mt-2 rounded-xl border border-gold/30 bg-gold-bg/40 p-3 text-[0.78rem] text-ink-2 font-normal">
                🛡️ <strong>Zero Card/UPI Storage Guarantee:</strong> Dev Creation <strong>never</strong> stores, views, or processes credit card numbers, debit card numbers, CVVs, expiration dates, net banking passwords, or UPI PINs. All financial transactions take place inside Razorpay&apos;s PCI-DSS Level 1 compliant secure infrastructure.
              </div>
            </li>
            <li>
              <strong className="text-ink font-medium">Device & Technical Information:</strong> IP address, device type, operating system, browser type, referral URLs, and pages visited, collected through standard web logs and essential session cookies.
            </li>
            <li>
              <strong className="text-ink font-medium">Customer Support Communications:</strong> Queries, feedback, or messages sent to us via WhatsApp, email, or our contact concierge form.
            </li>
          </ul>
        </section>

        {/* How We Use Your Data */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            3. How We Use Your Information
          </h2>
          <p className="mb-3">Your personal data is used solely for legitimate business purposes:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
              <h4 className="font-medium text-ink mb-1 text-sm">📦 Order Fulfillment</h4>
              <p className="text-xs text-body leading-relaxed">
                Handcrafting, packaging, and dispatching your products, and transmitting delivery details to our shipping partners.
              </p>
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
              <h4 className="font-medium text-ink mb-1 text-sm">📄 Billing & Notifications</h4>
              <p className="text-xs text-body leading-relaxed">
                Generating tax invoices, sending real-time SMS/WhatsApp delivery updates, and notifying you about your order progress.
              </p>
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
              <h4 className="font-medium text-ink mb-1 text-sm">💬 Concierge Support</h4>
              <p className="text-xs text-body leading-relaxed">
                Assisting you with scent selections, order modifications, address corrections, returns, or payment resolutions.
              </p>
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-2 p-4">
              <h4 className="font-medium text-ink mb-1 text-sm">✨ Dev Creation Circle</h4>
              <p className="text-xs text-body leading-relaxed">
                Sending private sales invitations and seasonal candle releases, only if you voluntarily subscribe to our fragrance newsletter.
              </p>
            </div>
          </div>
        </section>

        {/* Third-Party Disclosure */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            4. Information Sharing & Third-Party Service Providers
          </h2>
          <p className="mb-3">
            <strong>We do not sell, rent, trade, or monetize your personal information to third parties.</strong> We only share necessary data with trusted operational partners strictly bound by confidentiality:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Payment Gateways (Razorpay):</strong> Transaction details are transmitted securely to complete payment verification, refunds, and fraud prevention.
            </li>
            <li>
              <strong>Logistics & Courier Partners (Delhivery, BlueDart, DTDC, Xpressbees):</strong> Name, shipping address, and phone number are shared solely to ensure delivery of your parcel to your doorstep.
            </li>
            <li>
              <strong>Legal Compliance:</strong> We may disclose information if mandated by law, court order, or governmental authorities in accordance with applicable Indian laws.
            </li>
          </ul>
        </section>

        {/* Security & Retention */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            5. Data Protection, Security & Retention
          </h2>
          <p className="mb-3">
            We implement comprehensive technical and organizational measures to safeguard your personal data against unauthorized access, alteration, disclosure, or destruction:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>256-Bit SSL Encryption:</strong> All data transmitted between your browser and our website is protected by modern HTTPS / TLS encryption.</li>
            <li><strong>Secure Cloud Infrastructure:</strong> Backend databases are stored on secured servers with strict firewall access rules and password salting/hashing.</li>
            <li><strong>Retention Period:</strong> We retain order records for the duration required by applicable Indian tax, accounting, and consumer protection laws (typically up to 7 years for financial audits), after which records are anonymized or permanently deleted.</li>
          </ul>
        </section>

        {/* User Rights */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            6. Your Privacy Rights
          </h2>
          <p className="mb-3">
            As a valued customer under Indian data protection regulations, you possess the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Access and review the personal information stored in your account.</li>
            <li>Update, correct, or complete inaccurate personal and address details.</li>
            <li>Request deletion of your account and personal information, subject to mandatory statutory retention rules.</li>
            <li>Opt out of marketing newsletters at any time by clicking the &ldquo;Unsubscribe&rdquo; link in our emails or by contacting our concierge.</li>
          </ul>
        </section>

        {/* Cookies */}
        <section className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            7. Cookies & Tracking Technologies
          </h2>
          <p>
            Our website uses lightweight session cookies to maintain your shopping cart, remember your login session, and understand how visitors navigate our shop. You can configure your browser to reject cookies, though certain storefront features (such as persistent shopping cart items) may function with reduced convenience.
          </p>
        </section>

        {/* Grievance Officer - Mandatory for Razorpay & IT Act */}
        <section className="rounded-2xl border border-gold/40 bg-gold-bg/30 p-7 sm:p-9 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-copper">
              Official IT Compliance
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-medium text-ink mb-3">
            8. Grievance Officer Details
          </h2>
          <p className="mb-4 text-xs sm:text-sm text-body">
            In accordance with the <em>Information Technology Act, 2000</em> and the Consumer Protection (E-Commerce) Rules, 2020, the name and contact details of our designated Grievance Officer are published below:
          </p>

          <div className="rounded-xl border border-gold/40 bg-white p-5 text-xs sm:text-sm">
            <p className="font-medium text-ink">Grievance Officer: Dev Creation Compliance Desk</p>
            <p className="mt-1 text-ink-2">Enterprise: Dev Creation (devcreation24.in)</p>
            <p className="mt-1 text-ink-2">Location: India</p>
            <p className="mt-1">
              Email:{' '}
              <a href="mailto:support@devcreation24.in" className="font-medium text-gold-dk underline hover:text-gold">
                support@devcreation24.in
              </a>
            </p>
            <p className="mt-1">
              Helpline Phone / WhatsApp:{' '}
              <a href="tel:+917887582008" className="font-medium text-ink hover:text-gold">
                +91 788 758 2008
              </a>
            </p>
            <p className="mt-2 text-[0.72rem] text-ink-3">
              Grievances are acknowledged within 48 hours and redressed within 30 days from receipt.
            </p>
          </div>
        </section>

        {/* Contact Links */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-3">
          <p>Questions about this policy? Contact our team anytime.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="font-medium text-ink hover:text-gold underline">
              Contact Concierge →
            </Link>
            <Link href="/terms-and-conditions" className="font-medium text-ink hover:text-gold underline">
              Terms & Conditions →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
