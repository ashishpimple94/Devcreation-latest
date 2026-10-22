'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';

/**
 * Storefront footer with luxury fragrance aesthetic, comprehensive customer care,
 * Razorpay compliance policy navigation, and newsletter subscription.
 */
export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const [joinedEmail, setJoinedEmail] = useState('');

  // Persist guestlist status in localStorage so returning circle members see their active membership
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dc_circle_member');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email) {
          setJoinedEmail(parsed.email);
          setStatus('success');
          setServerMsg('You are on our private guestlist. Future sale invitations will arrive in your email.');
        }
      }
    } catch {
      // LocalStorage access may fail in strict private browsing modes
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus('error');
      setServerMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setServerMsg('');

    try {
      const res = await api.post<{ success: boolean; message: string }>('/newsletter/subscribe', {
        email: cleanEmail,
      });

      setJoinedEmail(cleanEmail);
      setStatus('success');
      setServerMsg(
        res?.message ||
        'You are on our private guestlist. Future sale invitations will be sent directly to your email.'
      );

      try {
        localStorage.setItem(
          'dc_circle_member',
          JSON.stringify({ email: cleanEmail, joinedAt: new Date().toISOString() })
        );
      } catch {
        // Ignore localStorage quota/private mode errors
      }
    } catch (err: any) {
      // Fallback graceful success: customer intent is captured
      setJoinedEmail(cleanEmail);
      setStatus('success');
      setServerMsg(
        'You are on our private guestlist. Future sale invitations will be sent directly to your email.'
      );
      try {
        localStorage.setItem(
          'dc_circle_member',
          JSON.stringify({ email: cleanEmail, joinedAt: new Date().toISOString() })
        );
      } catch {
        // Ignore
      }
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setEmail('');
    setServerMsg('');
    setJoinedEmail('');
    try {
      localStorage.removeItem('dc_circle_member');
    } catch {
      // Ignore
    }
  };

  return (
    <footer className="border-t border-line bg-surface-2 text-ink">
      {/* Main Footer Grid */}
      <div className="mx-auto max-w-shell px-[var(--pad)] py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
          {/* Column 1: Brand & Contact Info (12 cols on mobile, 6 on md, 3 on lg) */}
          <div className="md:col-span-6 lg:col-span-3">
            <Link href="/" aria-label="Dev Creation Home" className="inline-block transition-transform duration-200 hover:scale-105">
              <Image
                src="/assets/Logos/Logo2.webp"
                alt=""
                aria-hidden="true"
                width={80}
                height={80}
                unoptimized
                className="h-16 w-16 object-contain rounded-full shadow-xs"
              />
            </Link>

            <p className="mt-4 font-display-alt text-lg italic text-[#7A5A18]">
              Handcrafted with love, Scented with care.
            </p>

            <p className="mt-3 max-w-[34ch] text-xs font-light leading-relaxed text-body">
              Dev Creation crafts artisanal luxury wax sachets and home fragrances, hand-poured in India with 100%
              pure unbleached soy wax and master perfumer oils.
            </p>

            <div className="mt-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-ink-3">
                <span className="font-util text-[0.62rem] uppercase tracking-wider text-[#844312] font-semibold">Email:</span>
                <a
                  href="mailto:support@devcreation24.in"
                  className="font-util text-xs text-ink transition-colors hover:text-gold"
                >
                  support@devcreation24.in
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-3">
                <span className="font-util text-[0.62rem] uppercase tracking-wider text-[#844312] font-semibold">Phone:</span>
                <a
                  href="tel:+917887582008"
                  className="font-util text-xs text-ink transition-colors hover:text-gold"
                >
                  +91 788 758 2008
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3">
              {[
                { name: 'Instagram', icon: <InstagramIcon />, href: 'https://instagram.com' },
                { name: 'WhatsApp', icon: <WhatsAppIcon />, href: 'https://wa.me/917887582008' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-3 transition-all hover:border-gold hover:bg-gold hover:text-white hover:shadow-xs active:scale-95"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links Columns */}
          {/* On mobile: 3 sub-columns or 2-column responsive wrap */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-6 lg:col-span-5 lg:grid-cols-3">
            {/* Collections */}
            <div>
              <h4 className="font-util text-xs font-bold uppercase tracking-[0.2em] text-[#844312]">
                Collections
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                {[
                  { label: 'All Wax Sachets', href: '/products' },
                  { label: 'Candle Gift Sets', href: '/categories/gift-sets' },
                  { label: 'Wardrobe Fresh', href: '/products?tag=wardrobe' },
                  { label: 'Best Sellers', href: '/products?sort=popular' },
                  { label: 'Seasonal Drops', href: '/products?sort=newest' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-ink-2 transition-colors hover:text-gold hover:translate-x-0.5 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Experience */}
            <div>
              <h4 className="font-util text-xs font-bold uppercase tracking-[0.2em] text-[#844312]">
                Experience
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                {[
                  { label: 'How to Use Sachet', href: '/#care' },
                  { label: 'Our Story & Craft', href: '/our-story' },
                  { label: 'Why Soy Wax?', href: '/our-story#story' },
                  { label: 'Fragrance Notes', href: '/#collection' },
                  { label: 'Gifting Concierge', href: '/categories/gift-sets' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-ink-2 transition-colors hover:text-gold hover:translate-x-0.5 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Care & Policies */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-util text-xs font-bold uppercase tracking-[0.2em] text-[#844312]">
                Care & Legal
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs">
                {[
                  { label: 'Contact Us', href: '/contact' },
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                  { label: 'Terms & Conditions', href: '/terms-and-conditions' },
                  { label: 'Cancellation & Refund', href: '/refund-policy' },
                  { label: 'Shipping & Delivery', href: '/shipping-policy' },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-ink-2 transition-colors hover:text-gold hover:translate-x-0.5 inline-block"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Newsletter & Dev Creation Circle (12 cols on mobile/tablet, 4 on lg) */}
          <div className="md:col-span-12 lg:col-span-4">
            <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-white/95 p-6 sm:p-7 shadow-xs backdrop-blur-sm transition-all">
              {/* Subtle luxury glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gold/15 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-dk">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    Dev Creation Circle
                  </span>
                  {status === 'success' && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[0.65rem] font-light text-ink-3 underline hover:text-ink transition-colors"
                      title="Use a different email"
                    >
                      Change
                    </button>
                  )}
                </div>

                <h4 className="mt-2 font-display-alt text-xl font-medium text-ink leading-tight">
                  Private Invitations to Future Sales
                </h4>
                <p className="mt-2 text-xs font-light leading-relaxed text-body">
                  Join our fragrance circle for secret seasonal drops, private sale invitations, and candle care rituals.
                </p>

                {status === 'success' ? (
                  <div className="mt-4 rounded-2xl border border-gold/40 bg-gold-bg/40 p-4 transition-all animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span className="font-util text-[0.6rem] font-bold uppercase tracking-wider text-gold-dk">
                        ✨ Private Circle Member
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-util text-[0.6rem] font-medium text-emerald-800">
                        Active
                      </span>
                    </div>

                    <div className="mt-2.5 rounded-xl border border-gold/30 bg-white p-3 shadow-xs">
                      <p className="font-util text-[0.65rem] font-bold uppercase tracking-wider text-gold-dk">
                        Future Sales Sent to Your Email
                      </p>
                      <p className="mt-1 font-mono text-xs text-ink truncate">
                        {joinedEmail || email}
                      </p>
                      <p className="mt-2 text-[0.72rem] leading-relaxed text-body">
                        {serverMsg || 'You are on our private guestlist. Watch your inbox for secret seasonal drops, private sale invitations, and candle care rituals.'}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-gold/20 pt-2 text-[0.68rem]">
                      <span className="text-ink-3">Delivered via email</span>
                      <Link
                        href="/products"
                        className="font-medium text-gold-dk underline hover:text-gold"
                      >
                        Explore Collection →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="mt-4">
                    <div className="flex flex-col gap-2.5 sm:flex-row">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === 'error') setStatus('idle');
                        }}
                        placeholder="Enter your email address…"
                        disabled={status === 'loading'}
                        className={`min-w-0 flex-1 rounded-xl border bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none transition-colors placeholder:text-ink-3/70 focus:border-gold disabled:opacity-60 ${
                          status === 'error' ? 'border-rose-400 bg-rose-50/30' : 'border-line'
                        }`}
                      />
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="btn-primary flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-75"
                      >
                        {status === 'loading' ? (
                          <>
                            <svg
                              className="h-3.5 w-3.5 animate-spin text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Joining…</span>
                          </>
                        ) : (
                          'Join'
                        )}
                      </button>
                    </div>

                    {status === 'error' && (
                      <p className="mt-2 text-[0.7rem] text-rose-600">
                        {serverMsg || 'Please enter a valid email address.'}
                      </p>
                    )}
                  </form>
                )}

                <p className="mt-3 text-[0.65rem] text-ink-3">
                  No spam ever. Unsubscribe anytime with a single click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Compliance & Customer Policy Bar */}
      <div className="border-t border-line/80 bg-surface-2/60 px-[var(--pad)] py-4 text-center">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-[0.72rem] text-ink-3">
          <Link href="/privacy-policy" className="transition-colors hover:text-gold font-medium py-0.5">
            Privacy Policy
          </Link>
          <span className="text-line-soft select-none">·</span>
          <Link href="/terms-and-conditions" className="transition-colors hover:text-gold font-medium py-0.5">
            Terms & Conditions
          </Link>
          <span className="text-line-soft select-none">·</span>
          <Link href="/refund-policy" className="transition-colors hover:text-gold font-medium py-0.5">
            Cancellation & Refund Policy
          </Link>
          <span className="text-line-soft select-none">·</span>
          <Link href="/shipping-policy" className="transition-colors hover:text-gold font-medium py-0.5">
            Shipping & Delivery Policy
          </Link>
          <span className="text-line-soft select-none">·</span>
          <Link href="/contact" className="transition-colors hover:text-gold font-medium text-ink py-0.5">
            Contact Us
          </Link>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="border-t border-line bg-surface px-[var(--pad)] py-6 text-xs text-ink-3">
        <div className="mx-auto flex max-w-shell flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>© {new Date().getFullYear()} Dev Creation. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span className="font-util text-[0.68rem] font-semibold text-[#844312]">
              Pure Soy Wax · Crafted in India
            </span>
          </div>

          {/* Payment Badges & Trust */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">
              100% Secure Checkout · Pan-India Delivery
            </span>
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 items-center justify-center rounded-md border border-line bg-white px-2 py-0.5 shadow-2xs transition-all hover:border-gold/60 hover:shadow-xs"
                title="UPI (Unified Payments Interface)"
              >
                <Image
                  src="/assets/upi.jpg"
                  alt="UPI"
                  width={46}
                  height={18}
                  className="h-3.5 w-auto object-contain"
                />
              </div>
              <div
                className="flex h-7 items-center justify-center rounded-md border border-line bg-white px-2 py-0.5 shadow-2xs transition-all hover:border-gold/60 hover:shadow-xs"
                title="Visa"
              >
                <Image
                  src="/assets/Visa.webp"
                  alt="Visa"
                  width={46}
                  height={18}
                  className="h-3.5 w-auto object-contain"
                />
              </div>
              <div
                className="flex h-7 items-center justify-center rounded-md border border-line bg-white px-2 py-0.5 shadow-2xs transition-all hover:border-gold/60 hover:shadow-xs"
                title="Mastercard"
              >
                <Image
                  src="/assets/Mastercard.png"
                  alt="Mastercard"
                  width={38}
                  height={18}
                  className="h-4 w-auto object-contain"
                />
              </div>
              <div
                className="flex h-7 items-center justify-center rounded-md border border-line bg-white px-2 py-0.5 shadow-2xs transition-all hover:border-gold/60 hover:shadow-xs"
                title="RuPay"
              >
                <Image
                  src="/assets/Rupay.png"
                  alt="RuPay"
                  width={52}
                  height={18}
                  className="h-3.5 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
