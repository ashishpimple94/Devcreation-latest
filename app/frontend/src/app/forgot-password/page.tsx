'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { AuthShell } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ delivered: boolean; devToken?: string }>(
        '/auth/forgot-password',
        { email },
        { auth: false },
      );
      setSent(true);
      if (res.data.devToken) setDevToken(res.data.devToken);
      success('Reset link sent — check your inbox');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your account email and we'll send you a secure reset link."
      badge="Account Recovery"
      backHref="/login"
      backLabel="Back to Sign In"
    >
      {sent ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center gap-5 py-4 text-center">
          {/* Animated check */}
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-60" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-4 ring-emerald-100 text-emerald-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          <div className="max-w-xs">
            <h2 className="font-display-alt text-xl font-semibold text-ink">Check your inbox</h2>
            <p className="mt-2 text-sm leading-relaxed text-body">
              We've sent a reset link to <strong className="text-ink">{email}</strong>.
              It expires in <strong className="text-ink">15 minutes</strong>.
            </p>
            <p className="mt-2 text-xs text-ink-3">
              Don't see it? Check your spam folder, or try again below.
            </p>
          </div>

          {/* Dev token (development only) */}
          {devToken && (
            <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-left">
              <p className="font-util text-[0.6rem] font-bold uppercase tracking-wider text-amber-700">Dev Environment Token</p>
              <p className="mt-1 break-all font-mono text-[0.65rem] text-amber-900">{devToken}</p>
            </div>
          )}

          <div className="flex w-full flex-col gap-2.5">
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-deep py-3 font-util text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:bg-[#3D2A1E] hover:shadow-md"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Back to Sign In
            </Link>
            <button
              type="button"
              onClick={() => { setSent(false); setDevToken(null); }}
              className="w-full rounded-xl border border-line py-2.5 font-util text-xs font-semibold uppercase tracking-wider text-ink-3 transition-all duration-200 hover:border-gold/50 hover:text-ink"
            >
              Try a different email
            </button>
          </div>
        </div>
      ) : (
        /* ── Request form ── */
        <form onSubmit={onSubmit} className="space-y-5">

          {/* Email field */}
          <div>
            <label className="mb-1.5 block font-util text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-3">
              Email Address
            </label>
            <div className="flex overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15 hover:border-gold/50">
              <span className="flex items-center pl-3.5 text-ink-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-ink-3/50"
              />
            </div>
            <p className="mt-1.5 text-[0.65rem] text-ink-3">
              We'll send a secure one-time reset link to this address.
            </p>
          </div>

          {/* Info callout */}
          <div className="flex items-start gap-3 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-gold">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
            <p className="text-[0.72rem] leading-relaxed text-ink-3">
              The link expires in 15 minutes. If you signed up via <strong className="text-ink">Mobile OTP</strong>, you can sign in directly without a password.
            </p>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Sending reset link…' : 'Send Reset Link →'}
          </Button>

          {/* Divider + back */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 border-t border-line" />
            <span className="font-util text-[0.62rem] uppercase tracking-widest text-ink-3">or</span>
            <div className="flex-1 border-t border-line" />
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/login"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 font-util text-xs font-semibold uppercase tracking-wider text-ink-2 transition-all duration-200 hover:border-gold/50 hover:text-gold-dk"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 font-util text-xs font-semibold uppercase tracking-wider text-ink-2 transition-all duration-200 hover:border-gold/50 hover:text-gold-dk"
            >
              Create Account
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
