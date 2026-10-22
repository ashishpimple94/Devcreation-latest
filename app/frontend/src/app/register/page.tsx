'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

/* ── helpers ─────────────────────────────────────────────────────── */
function EyeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOffIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function pwScore(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABEL = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'];

/* ── main component ──────────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const refreshCart = useCartStore((s) => s.refresh);
  const { error, success } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'done'>('form');

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const score = useMemo(() => pwScore(form.password), [form.password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      await refreshCart().catch(() => {});
      success(`Welcome to Dev Creation, ${form.name}!`);
      setStep('done');
      setTimeout(() => router.push('/products'), 1800);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full bg-[#FAF7F2] text-ink selection:bg-gold/20 selection:text-gold-dk overflow-hidden">

      {/* ── Left editorial panel (desktop only) ── */}
      <section className="relative hidden lg:flex lg:w-5/12 xl:w-[42%] flex-col justify-between p-6 xl:p-8 text-white h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/elegant-display-lit-candles-with-golden-holders-marble-table-featuring-decorative-plant_93675-335471.avif"
            alt="Dev Creation artisanal fragrances"
            fill priority
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/92 via-deep/55 to-deep/28" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(184,148,63,0.22),transparent_55%)]" />
        </div>

        {/* Top */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/products" className="group inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-util text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md transition-all hover:border-gold hover:bg-gold/20">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5"><polyline points="15 18 9 12 15 6" /></svg>
            Return to Shop
          </Link>
          <span className="font-util text-[0.6rem] font-bold uppercase tracking-[0.22em] text-gold-lt/80">Dev Creation</span>
        </div>

        {/* Middle */}
        <div className="relative z-10 my-auto py-2">
          <span className="inline-flex items-center gap-2 font-util text-[0.62rem] font-bold uppercase tracking-[0.24em] text-gold-lt">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-lt" />
            Join the Fragrance Family
          </span>

          <h2 className="mt-2 font-display-alt text-2xl xl:text-3xl font-medium leading-[1.15] text-white">
            Your sanctuary of<br />
            <span className="italic text-gold-lt">scent awaits.</span>
          </h2>

          <p className="mt-2 max-w-xs text-xs font-light leading-relaxed text-white/80">
            Create your free account and unlock exclusive member benefits — from private seasonal drops to bespoke fragrance curation for your home.
          </p>

          {/* Perks */}
          <div className="mt-3 space-y-2">
            {[
              { icon: '🎁', title: 'Exclusive Member Offers', body: 'Priority access to seasonal drops & private sales.' },
              { icon: '📦', title: 'Live Order Tracking', body: 'Real-time SMS & dashboard updates on every delivery.' },
              { icon: '✨', title: 'Free Sample with Every Order', body: 'Discover a new scent with every Dev Creation package.' },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md transition-all hover:border-gold/40 hover:bg-white/10">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-xs">{p.icon}</span>
                <div>
                  <p className="font-util text-[0.68rem] font-semibold uppercase tracking-wider text-white">{p.title}</p>
                  <p className="text-[0.65rem] text-white/65">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-3 font-util text-[0.62rem] uppercase tracking-widest text-white/60">
          <span>Pure Soy Wax · IFRA Certified</span>
          <span className="text-gold-lt">Hand-Poured in India</span>
        </div>
      </section>

      {/* ── Right form panel ── */}
      <section className="relative flex h-screen w-full flex-col justify-center items-center p-3 sm:p-5 lg:p-6 lg:w-7/12 xl:w-[58%] overflow-hidden">

        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-copper/8 blur-3xl" />

        <div className="relative z-10 w-full max-w-[420px] mx-auto">

          {/* Mobile back link */}
          <div className="mb-2.5 flex items-center justify-between lg:hidden">
            <Link href="/products" className="inline-flex items-center gap-1.5 font-util text-xs uppercase tracking-wider text-ink-3 transition-colors hover:text-gold-dk">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              Back to shop
            </Link>
            <Link href="/login" className="font-util text-xs uppercase tracking-wider text-gold-dk hover:underline">Sign in</Link>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-gold/25 bg-white/97 shadow-[0_16px_40px_-15px_rgba(44,24,16,0.08)] backdrop-blur-md">

            {/* Gold top strip */}
            <div className="h-1 bg-gradient-to-r from-gold via-copper to-gold-lt" />

            <div className="px-5 py-4 sm:px-6 sm:py-5">

              {/* Header */}
              <div className="mb-3 text-center">
                <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105">
                  <Image src="/assets/Logos/Logo2.png" alt="Dev Creation" width={48} height={48} unoptimized priority className="mx-auto h-10 w-10 rounded-full object-contain shadow-sm" />
                </Link>
                <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/8 px-2.5 py-0.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                  <span className="font-util text-[0.55rem] font-bold uppercase tracking-[0.2em] text-gold-dk">Free Membership</span>
                </div>
                <h1 className="mt-1 font-display-alt text-xl font-semibold text-ink sm:text-2xl">Create your account</h1>
                <p className="mx-auto mt-0.5 max-w-xs text-[0.72rem] leading-tight text-body">
                  Join Dev Creation's fragrance family — free forever.
                </p>
              </div>

              {/* ── Success state ── */}
              {step === 'done' ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-display-alt text-lg font-semibold text-ink">Welcome, {form.name.split(' ')[0]}!</p>
                    <p className="mt-0.5 text-xs text-body">Your account is ready. Taking you to the collection…</p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full animate-[slide-progress_1.8s_linear_forwards] rounded-full bg-gold" />
                  </div>
                </div>
              ) : (
                /* ── Registration form ── */
                <form onSubmit={onSubmit} className="space-y-2.5">

                  <RegField
                    label="Full Name"
                    placeholder="e.g. Priya Sharma"
                    value={form.name}
                    onChange={set('name')}
                    required
                    autoComplete="name"
                    icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                  />

                  <RegField
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={set('email')}
                    required
                    autoComplete="email"
                    icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
                  />

                  {/* Password with strength */}
                  <div>
                    <label className="mb-1 block font-util text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-3">Password</label>
                    <div className="relative flex items-center overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15 hover:border-gold/50">
                      <span className="pointer-events-none pl-3.5 text-ink-3">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={form.password}
                        onChange={set('password')}
                        placeholder="Min. 8 characters"
                        className="w-full bg-transparent py-2.5 pl-3 pr-10 text-xs sm:text-sm text-ink outline-none placeholder:text-ink-3/50"
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 text-ink-3 transition-colors hover:text-gold-dk" aria-label={showPw ? 'Hide password' : 'Show password'}>
                        {showPw ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>

                    {/* Strength meter */}
                    {form.password && (
                      <div className="mt-1.5 space-y-0.5">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div key={i} className={cn('h-1 flex-1 rounded-full transition-all duration-300', i < score ? STRENGTH_COLOR[score] : 'bg-surface-3')} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Terms */}
                  <p className="text-[0.62rem] leading-tight text-ink-3">
                    By creating an account you agree to our{' '}
                    <Link href="/terms" className="text-gold-dk underline hover:text-ink">Terms</Link>
                    {' '}&amp;{' '}
                    <Link href="/privacy-policy" className="text-gold-dk underline hover:text-ink">Privacy Policy</Link>.
                  </p>

                  <Button type="submit" loading={loading} className="w-full py-2.5 text-xs tracking-[0.14em]">
                    {loading ? 'Creating your account…' : 'Create Free Account →'}
                  </Button>

                  <div className="relative flex items-center gap-2">
                    <div className="flex-1 border-t border-line" />
                    <span className="font-util text-[0.58rem] uppercase tracking-widest text-ink-3">or</span>
                    <div className="flex-1 border-t border-line" />
                  </div>

                  <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-2 font-util text-xs font-semibold uppercase tracking-wider text-ink-2 transition-all duration-200 hover:border-gold/50 hover:bg-gold/5 hover:text-gold-dk">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                    Sign in to existing account
                  </Link>
                </form>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-3 flex items-center justify-center gap-3 font-util text-[0.58rem] uppercase tracking-wider text-ink-3">
            <span className="flex items-center gap-1"><span>🌿</span> Pure Soy Wax</span>
            <span className="opacity-30">·</span>
            <span className="flex items-center gap-1"><span>🔒</span> Secure</span>
            <span className="opacity-30">·</span>
            <span className="flex items-center gap-1"><span>🇮🇳</span> India</span>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── shared field sub-component ────────────────────────────────── */
function RegField({
  label, icon, ...rest
}: {
  label: string;
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block font-util text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</label>
      <div className="relative flex items-center overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15 hover:border-gold/50">
        {icon && <span className="pointer-events-none pl-3.5 text-ink-3">{icon}</span>}
        <input
          {...rest}
          className={cn(
            'w-full bg-transparent py-3 pr-4 text-sm text-ink outline-none placeholder:text-ink-3/50',
            icon ? 'pl-3' : 'pl-4',
          )}
        />
      </div>
    </div>
  );
}
