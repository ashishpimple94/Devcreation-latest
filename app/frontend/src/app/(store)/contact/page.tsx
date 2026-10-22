'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PolicyNav } from '@/components/legal/PolicyNav';
import { ScrollAnimate } from '@/components/ScrollAnimate';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: 'general',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    // Simulate concierge ticket creation
    setTimeout(() => {
      const generatedId = 'DC-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(generatedId);
      setStatus('submitted');
    }, 700);
  };

  return (
    <div className="mx-auto max-w-shell px-[var(--pad)] py-12 lg:py-16">
      <PolicyNav current="/contact" />

      {/* Hero Header */}
      <div className="text-center">
        <ScrollAnimate>
          <span className="util-label mb-2 block">We Are Here For You</span>
          <h1 className="font-display-alt text-4xl sm:text-5xl font-medium text-ink">
            Contact Concierge
          </h1>
        </ScrollAnimate>
        <ScrollAnimate delay={100}>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-body font-light leading-relaxed">
            Have questions about our handcrafted wax fragrances, an existing order, custom gifting, or payment assistance?
            Our artisan team in India is ready to assist you.
          </p>
        </ScrollAnimate>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Contact Information & Official Verification Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-7 shadow-xs">
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-copper block mb-3">
              Direct Assistance
            </span>
            <h2 className="font-display text-2xl font-medium text-ink mb-6">
              Get in Touch
            </h2>

            <div className="space-y-5 text-sm">
              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-dk">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="font-util text-[0.68rem] uppercase tracking-wider text-ink-3">Phone & Helpline</div>
                  <a
                    href="tel:+917887582008"
                    className="mt-0.5 inline-block font-medium text-ink transition-colors hover:text-gold"
                  >
                    +91 788 758 2008
                  </a>
                  <p className="text-xs text-ink-3">Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-util text-[0.68rem] uppercase tracking-wider text-ink-3">Instant WhatsApp Support</div>
                  <a
                    href="https://wa.me/917887582008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-block font-medium text-emerald-700 transition-colors hover:underline"
                  >
                    Chat on WhatsApp (+91 788 758 2008)
                  </a>
                  <p className="text-xs text-ink-3">Fastest for order status & scent guidance</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-dk">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-util text-[0.68rem] uppercase tracking-wider text-ink-3">Customer Support Email</div>
                  <a
                    href="mailto:support@devcreation24.in"
                    className="mt-0.5 inline-block font-medium text-ink transition-colors hover:text-gold"
                  >
                    support@devcreation24.in
                  </a>
                  <p className="text-xs text-ink-3">Replies within 24 hours</p>
                </div>
              </div>

              {/* Customer Concierge */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-dk">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div className="font-util text-[0.68rem] uppercase tracking-wider text-ink-3">Artisan Concierge Desk</div>
                  <p className="mt-0.5 font-medium text-ink leading-relaxed">
                    Dev Creation<br />
                    Handcrafted in India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Operating Hours Box */}
          <div className="rounded-2xl border border-line bg-surface-2 p-6">
            <h3 className="font-util text-xs font-semibold uppercase tracking-[0.16em] text-copper mb-3">
              Operating Hours (IST)
            </h3>
            <ul className="space-y-2 text-xs text-ink-2">
              <li className="flex justify-between border-b border-line-soft pb-1.5">
                <span>Monday – Friday:</span>
                <span className="font-medium text-ink">10:00 AM – 7:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-line-soft pb-1.5">
                <span>Saturday:</span>
                <span className="font-medium text-ink">10:00 AM – 5:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday:</span>
                <span className="text-copper italic">Closed (Studio Pouring Rituals)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Concierge Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-line bg-surface p-7 sm:p-9 shadow-xs">
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-dk block mb-2">
              Send an Inquiry
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-2">
              We Would Love to Hear From You
            </h2>
            <p className="text-xs sm:text-sm text-body font-light mb-6">
              Fill out the form below and our fragrance concierge will get back to you shortly.
            </p>

            {status === 'submitted' ? (
              <div className="rounded-xl border border-gold/40 bg-gold-bg/40 p-6 text-center animate-in fade-in zoom-in-95">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold-dk">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-display-alt text-xl font-medium text-ink">
                  Inquiry Received
                </h3>
                <p className="mt-2 text-xs font-light text-body">
                  Thank you, <strong className="font-medium text-ink">{formData.name}</strong>. Your message has been logged under reference number:
                </p>
                <div className="mt-3 inline-block rounded-lg border border-gold/40 bg-white px-4 py-1.5 font-mono text-sm font-semibold text-deep">
                  {ticketId}
                </div>
                <p className="mt-3 text-xs text-ink-3">
                  A concierge specialist will review your request and reply to <span className="font-medium text-ink">{formData.email}</span> within 24 hours.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        orderNumber: '',
                        subject: 'general',
                        message: '',
                      });
                    }}
                    className="btn-ghost text-xs py-2.5 px-5"
                  >
                    Send Another Message
                  </button>
                  <a
                    href="https://wa.me/917887582008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    Message on WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-util text-[0.65rem] uppercase tracking-wider text-ink-3 block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none transition-colors focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-util text-[0.65rem] uppercase tracking-wider text-ink-3 block mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. priya@example.com"
                      className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none transition-colors focus:border-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="font-util text-[0.65rem] uppercase tracking-wider text-ink-3 block mb-1.5">
                      Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none transition-colors focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="font-util text-[0.65rem] uppercase tracking-wider text-ink-3 block mb-1.5">
                      Order ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="e.g. DC-10842"
                      className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none transition-colors focus:border-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-util text-[0.65rem] uppercase tracking-wider text-ink-3 block mb-1.5">
                    Inquiry Topic
                  </label>
                  <div className="relative">
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="luxury-select w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 pr-10 text-xs text-ink outline-none transition-all duration-200 hover:border-gold/70 focus:border-gold focus:ring-2 focus:ring-gold/20 cursor-pointer"
                    >
                      <option value="general">General Inquiry &amp; Fragrance Guidance</option>
                      <option value="order_status">Order Status &amp; Tracking</option>
                      <option value="payment">Payment &amp; Checkout Assistance (Razorpay / UPI)</option>
                      <option value="refund_return">Cancellation, Return &amp; Refund</option>
                      <option value="corporate_gifting">Custom Corporate Gifting &amp; Wedding Favors</option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="font-util text-[0.65rem] uppercase tracking-wider text-ink-3 block mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How may we assist you today? Please share any relevant order details or queries…"
                    className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none transition-colors focus:border-gold resize-y"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[0.7rem] text-ink-3">
                    By submitting, you agree to our{' '}
                    <Link href="/privacy-policy" className="text-gold-dk underline hover:text-gold">
                      Privacy Policy
                    </Link>.
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full sm:w-auto px-7 py-3 text-xs"
                  >
                    {status === 'submitting' ? 'Submitting…' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Quick FAQ Section */}
      <div className="mt-16 rounded-2xl border border-line bg-surface-2 p-8 sm:p-10">
        <div className="text-center mb-8">
          <span className="util-label mb-2 block">Common Questions</span>
          <h3 className="font-display-alt text-2xl sm:text-3xl font-medium text-ink">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="rounded-xl border border-line bg-white p-5">
            <h4 className="font-medium text-ink text-sm mb-2">When will my order arrive?</h4>
            <p className="text-body font-light leading-relaxed">
              Orders are hand-poured in small batches within 1–2 business days and delivered within 3–7 business days across India via our trusted courier partners. Tracking information is sent to your phone and email once dispatched.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <h4 className="font-medium text-ink text-sm mb-2">How do I request a cancellation or refund?</h4>
            <p className="text-body font-light leading-relaxed">
              You can cancel before your order is dispatched by contacting us via WhatsApp or email. In case of damaged or defective items, reach out within 48 hours of delivery and refunds are processed within 5–7 business days to your original payment method.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <h4 className="font-medium text-ink text-sm mb-2">Are payments safe and secure?</h4>
            <p className="text-body font-light leading-relaxed">
              Yes. All online payments are securely processed through Razorpay using industry-standard 256-bit SSL encryption and RBI-mandated protocols. We do not store any card or UPI credentials on our servers.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-white p-5">
            <h4 className="font-medium text-ink text-sm mb-2">Do you accommodate custom corporate or wedding orders?</h4>
            <p className="text-body font-light leading-relaxed">
              Yes, we create bespoke gift boxes and custom wax sachets for weddings, festivals, and corporate celebrations. Drop us a note using the form above or email support@devcreation24.in with your quantity and date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
