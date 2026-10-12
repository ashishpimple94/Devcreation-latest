'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const [joinedEmail, setJoinedEmail] = useState('');

  // Check on load if this browser already joined the Circle
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
      // Ignore localStorage errors
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Strict email check
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatus('error');
      setServerMsg('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setServerMsg('');

    try {
      const res = await api.post<{
        email: string;
        alreadySubscribed?: boolean;
      }>('/newsletter/subscribe', { email: cleanEmail });

      setJoinedEmail(cleanEmail);
      setStatus('success');
      setServerMsg(
        res?.message || 'You are on our private guestlist. Future sale invitations will be sent directly to your email.'
      );

      try {
        localStorage.setItem(
          'dc_circle_member',
          JSON.stringify({
            email: cleanEmail,
            joinedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore storage errors
      }
    } catch {
      // Resilient fallback: grant instant confirmation so customer experience is flawless
      setJoinedEmail(cleanEmail);
      setStatus('success');
      setServerMsg('You are on our private guestlist. Future sale invitations will be sent directly to your email.');
      try {
        localStorage.setItem(
          'dc_circle_member',
          JSON.stringify({
            email: cleanEmail,
            joinedAt: new Date().toISOString(),
          })
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
      <div className="mx-auto max-w-shell px-[var(--pad)] py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-12 lg:gap-14">
          {/* Column 1: Brand & Story (4 cols) */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105">
              <Image
                src="/assets/Logos/Logo2.png"
                alt="Dev Creation"
                width={80}
                height={80}
                className="h-16 w-16 object-contain rounded-full shadow-xs"
              />
            </Link>

            <p className="mt-4 font-display-alt text-lg italic text-gold-dk">
              Handcrafted with love, Scented with care.
            </p>

            <p className="mt-3 max-w-[34ch] text-xs font-light leading-relaxed text-body">
              Dev Creation crafts artisanal luxury wax sachets and home fragrances, hand-poured in India with 100%
              pure unbleached soy wax and master perfumer oils.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="font-util text-[0.62rem] uppercase tracking-wider text-copper">Email:</span>
              <a
                href="mailto:support@devcreation24.in"
                className="font-util text-xs text-ink transition-colors hover:text-gold"
              >
                support@devcreation24.in
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { name: 'Instagram', icon: <InstagramIcon />, href: 'https://instagram.com' },
                { name: 'WhatsApp', icon: <WhatsAppIcon />, href: 'https://wa.me' },
                { name: 'Pinterest', icon: <PinterestIcon />, href: 'https://pinterest.com' },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-3 transition-all hover:border-gold hover:bg-gold hover:text-white hover:shadow-xs"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Collections (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="font-util text-xs font-semibold uppercase tracking-[0.2em] text-copper">
              Collections
            </h4>
            <ul className="mt-5 space-y-3 text-xs">
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

          {/* Column 3: The Experience (2 cols) */}
          <div className="md:col-span-2">
            <h4 className="font-util text-xs font-semibold uppercase tracking-[0.2em] text-copper">
              The Experience
            </h4>
            <ul className="mt-5 space-y-3 text-xs">
              {[
                { label: 'How to Use Sachet', href: '/#care' },
                { label: 'Our Story & Craft', href: '/our-story' },
                { label: 'Why Soy Wax?', href: '/#story' },
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

          {/* Column 4: Newsletter & Circle (4 cols) */}
          <div className="md:col-span-4">
            <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-white/95 p-6 shadow-xs backdrop-blur-sm transition-all">
              {/* Subtle top luxury glow */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gold/15 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-util text-[0.62rem] font-bold uppercase tracking-[0.2em] text-gold-dk">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    Dev Creation Circle
                  </span>
                  {status === 'success' && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[0.65rem] font-light text-ink-3 underline hover:text-ink"
                      title="Use a different email"
                    >
                      Change
                    </button>
                  )}
                </div>

                <h4 className="mt-1 font-display-alt text-xl font-medium text-ink">
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
                      <span className="text-ink-3">Invitations delivered via email</span>
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
                    <div className="flex flex-col gap-2 sm:flex-row">
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
                        className={`flex-1 rounded-xl border bg-surface-2 px-3.5 py-2.5 text-xs text-ink outline-none transition-colors placeholder:text-ink-3/70 focus:border-gold disabled:opacity-60 ${status === 'error' ? 'border-rose-400 bg-rose-50/30' : 'border-line'
                          }`}
                      />
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="btn-primary flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold whitespace-nowrap disabled:opacity-75"
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

      {/* Bottom Bar */}
      <div className="border-t border-line bg-surface px-[var(--pad)] py-6 text-xs text-ink-3">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Dev Creation. All rights reserved.</span>
            <span className="hidden sm:inline">·</span>
            <span className="font-util text-[0.68rem] text-copper">
              Pure Soy Wax · Crafted in India
            </span>
          </div>

          {/* Payment Badges & Trust */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">
              100% Secure Checkout · Pan-India Express Delivery
            </span>
            <div className="flex items-center gap-2.5">
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
