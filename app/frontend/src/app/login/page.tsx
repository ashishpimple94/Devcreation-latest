'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/api';

type LoginMode = 'otp' | 'email';

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const loginWithOtp = useAuthStore((s) => s.loginWithOtp);
  const refreshCart = useCartStore((s) => s.refresh);
  const refreshNotifications = useNotificationStore((s) => s.refresh);
  const { error, success, info } = useToast();
  const status = useAuthStore((s) => s.status);

  const [mode, setMode] = useState<LoginMode>('otp');

  // Mobile OTP States
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpSent, setOtpSent] = useState(false);
  const [unverifiedTrialNotice, setUnverifiedTrialNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Email States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [takingLong, setTakingLong] = useState(false);

  // If already authenticated, redirect to collection or requested page
  useEffect(() => {
    if (status === 'authenticated') {
      const redirect = params.get('redirect');
      const target = redirect && redirect !== '/login' && redirect !== '/account' ? redirect : '/products';
      router.replace(target);
    }
  }, [status, params, router]);

  // Pre-warm backend when login page opens so cold-start delay is eliminated
  useEffect(() => {
    fetch(`${getApiUrl()}/health`, { method: 'GET' }).catch(() => {});
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loadingEmail || verifyingOtp) {
      timer = setTimeout(() => setTakingLong(true), 2500);
    } else {
      setTakingLong(false);
    }
    return () => clearTimeout(timer);
  }, [loadingEmail, verifyingOtp]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      error('Please enter a valid 10-digit mobile number');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await sendOtp(clean);
      setOtpSent(true);
      setCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);

      if (res.provider === 'simulated' && res.demoOtp) {
        setUnverifiedTrialNotice(res.demoOtp);
        info(`Twilio Trial mode: Real SMS is active for +91 9090385555. For test numbers, code is ${res.demoOtp}`);
      } else {
        setUnverifiedTrialNotice(null);
        success(`Verification code sent to +91 ${clean}`);
      }

      // Auto-focus first digit box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not send verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const submitOtpVerification = async (code: string) => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10 || code.length !== 6) return;

    setVerifyingOtp(true);
    try {
      const { isNewCustomer } = await loginWithOtp(clean, code);

      // New user — redirect to profile completion form before entering the store
      if (isNewCustomer) {
        router.push(`/complete-profile?phone=${encodeURIComponent(clean)}`);
        return;
      }

      // Existing user — proceed normally
      refreshCart().catch(() => {});
      refreshNotifications().catch(() => {});

      const currentUser = useAuthStore.getState().user;
      success(`Welcome to Dev Creation, ${currentUser?.name || 'Customer'}!`);

      let redirect = params.get('redirect');
      if (!redirect || redirect === '/account' || redirect === '/login') {
        redirect = '/products';
      }
      router.push(redirect);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Invalid verification code. Please check your SMS.');
      setVerifyingOtp(false);
      inputRefs.current[0]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      error('Please enter the complete 6-digit verification code');
      return;
    }
    submitOtpVerification(code);
  };

  const handleDigitChange = (index: number, val: string) => {
    const numeric = val.replace(/\D/g, '');
    if (!numeric) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Mobile SMS autofill / multi-digit paste: distribute across all 6 boxes
    if (numeric.length > 1) {
      const updated = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        if (numeric[i] !== undefined) updated[i] = numeric[i];
      }
      setOtpDigits(updated);
      if (numeric.length >= 6) {
        inputRefs.current[5]?.focus();
        submitOtpVerification(numeric.slice(0, 6));
      } else {
        inputRefs.current[Math.min(numeric.length, 5)]?.focus();
      }
      return;
    }

    const digit = numeric.slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    // Jump to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are typed
    const fullCode = updated.join('');
    if (fullCode.length === 6) {
      submitOtpVerification(fullCode);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || '';
    }
    setOtpDigits(updated);

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
      submitOtpVerification(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      await login(email.trim(), password);
      refreshCart().catch(() => {});
      refreshNotifications().catch(() => {});

      const currentUser = useAuthStore.getState().user;
      success(`Welcome back, ${currentUser?.name || 'Customer'}!`);

      let redirect = params.get('redirect');
      if (!redirect || redirect === '/account' || redirect === '/login') {
        redirect = '/products';
      }
      router.push(redirect);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setLoadingEmail(false);
    }
  };

  return (
    <div className="w-full">
      {/* High-End Segmented Mode Switcher */}
      <div className="mb-7 grid grid-cols-2 rounded-2xl border border-line/80 bg-surface-2/90 p-1.5 shadow-inner">
        <button
          type="button"
          onClick={() => setMode('otp')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 font-util text-xs font-semibold uppercase tracking-wider transition-all duration-200',
            mode === 'otp'
              ? 'bg-white text-ink shadow-[0_4px_16px_rgba(44,24,16,0.08)] border border-gold/30 font-bold'
              : 'text-ink-3 hover:text-ink hover:bg-white/40',
          )}
        >
          <svg className="h-4 w-4 text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
          <span>Mobile OTP</span>
          <span className="hidden sm:inline-block rounded-full bg-gold/15 px-1.5 py-0.5 text-[0.58rem] font-bold text-gold-dk uppercase tracking-tight">
            Fast
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMode('email')}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 font-util text-xs font-semibold uppercase tracking-wider transition-all duration-200',
            mode === 'email'
              ? 'bg-white text-ink shadow-[0_4px_16px_rgba(44,24,16,0.08)] border border-gold/30 font-bold'
              : 'text-ink-3 hover:text-ink hover:bg-white/40',
          )}
        >
          <svg className="h-4 w-4 text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span>Email &amp; Key</span>
        </button>
      </div>

      {mode === 'otp' ? (
        /* Mobile OTP Form */
        <div>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="util-label mb-2 block text-copper">
                  Mobile Number <span className="text-gold-dk">*</span>
                </label>
                <div className="relative flex items-center rounded-2xl border border-line bg-surface transition-all duration-200 focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15 shadow-xs">
                  <span className="flex items-center gap-1.5 border-r border-line/80 px-3.5 py-3.5 font-util text-xs font-bold text-ink-2 bg-surface-2/40 rounded-l-2xl">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full bg-transparent px-4 py-3.5 text-base font-medium tracking-wide text-ink outline-none placeholder:text-ink-3/50"
                  />
                </div>
                <p className="mt-2 text-[0.72rem] text-ink-3 flex items-center gap-1.5">
                  <span className="text-gold-dk">⚡</span>
                  <span>We will send a 6-digit one-time passcode via SMS.</span>
                </p>
              </div>

              <Button
                type="submit"
                loading={sendingOtp}
                className="btn-primary w-full shadow-md hover:shadow-lg"
              >
                {sendingOtp ? 'Dispatching SMS Code…' : 'Send Verification Code →'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="rounded-2xl border border-gold/40 bg-gold-bg/40 p-4 text-xs text-ink shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-gold-dk flex items-center gap-1">
                    <span>✨</span> Verification Code Sent
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setUnverifiedTrialNotice(null);
                      setOtpDigits(['', '', '', '', '', '']);
                    }}
                    className="font-util text-[0.68rem] font-bold uppercase tracking-wider text-gold-dk hover:text-ink underline transition-colors"
                  >
                    Change Number
                  </button>
                </div>
                <div className="mt-1.5 font-mono text-base font-bold text-ink">
                  +91 {phone.length === 10 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label className="util-label block text-copper">Enter 6-Digit Passcode</label>
                  <span className="font-util text-[0.62rem] text-gold-dk font-semibold tracking-wider uppercase">Auto-Submits</span>
                </div>

                {/* 6-Cell Digit Input Grid */}
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      value={otpDigits[index] || ''}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={handlePasteOtp}
                      autoFocus={index === 0}
                      className={cn(
                        'h-13 w-full rounded-2xl border bg-surface text-center font-mono text-xl font-bold text-ink outline-none transition-all duration-200',
                        otpDigits[index]
                          ? 'border-gold bg-gold/10 text-gold-dk shadow-sm ring-1 ring-gold/40'
                          : 'border-line focus:border-gold focus:ring-2 focus:ring-gold/20',
                      )}
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[0.7rem] text-ink-3 flex items-center gap-1">
                    <span>🔒</span>
                    <span>Valid for 5 minutes</span>
                  </span>

                  {countdown > 0 ? (
                    <span className="font-util text-[0.68rem] text-ink-3">
                      Resend in <strong className="text-gold-dk">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={sendingOtp}
                      className="font-util text-[0.68rem] font-bold uppercase tracking-wider text-gold-dk hover:text-ink underline transition-colors"
                    >
                      Resend SMS Code
                    </button>
                  )}
                </div>

                {/* Notice when using random unverified numbers with a Twilio trial account */}
                {unverifiedTrialNotice && (
                  <div className="mt-3.5 rounded-2xl border border-amber-300/80 bg-amber-50/95 p-3.5 text-xs text-amber-900 shadow-xs">
                    <div className="font-semibold flex items-center gap-1.5 text-amber-950">
                      <span>ℹ️</span>
                      <span>Twilio Sandbox Notice</span>
                    </div>
                    <p className="mt-1 text-[0.72rem] leading-relaxed text-amber-800">
                      Live SMS delivers to verified testing mobile (<strong>+91 9090385555</strong>).
                      For other numbers, test passcode is: <strong className="font-mono text-xs text-ink bg-white px-1.5 py-0.5 rounded border border-amber-300">{unverifiedTrialNotice}</strong> (or master code <strong className="font-mono">123456</strong>).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const d = unverifiedTrialNotice.split('');
                        setOtpDigits(d);
                        submitOtpVerification(unverifiedTrialNotice);
                      }}
                      className="mt-2 text-[0.68rem] font-bold uppercase tracking-wider text-amber-950 underline hover:text-black flex items-center gap-1"
                    >
                      <span>Auto-fill {unverifiedTrialNotice} &amp; Sign In</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                loading={verifyingOtp}
                disabled={otpDigits.join('').length !== 6 || verifyingOtp}
                className="btn-primary w-full shadow-md hover:shadow-lg"
              >
                {verifyingOtp ? 'Verifying Passcode…' : 'Verify & Enter Collection →'}
              </Button>
            </form>
          )}
        </div>
      ) : (
        /* Email & Password Form */
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="util-label mb-2 block text-copper">
              Email Address <span className="text-gold-dk">*</span>
            </label>
            <div className="relative flex items-center rounded-2xl border border-line bg-surface transition-all focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15 shadow-xs">
              <span className="pl-4 text-ink-3">
                <svg className="h-4 w-4 text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-ink-3/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="util-label block text-copper">
                Password <span className="text-gold-dk">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="font-util text-[0.65rem] font-semibold uppercase tracking-wider text-gold-dk hover:text-ink underline transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative flex items-center rounded-2xl border border-line bg-surface transition-all focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/15 shadow-xs">
              <span className="pl-4 text-ink-3">
                <svg className="h-4 w-4 text-gold-dk" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent px-3 py-3.5 text-sm text-ink outline-none placeholder:text-ink-3/50 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-ink-3 transition-colors hover:text-gold-dk"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loadingEmail}
            className="btn-primary mt-2 w-full shadow-md hover:shadow-lg"
          >
            {loadingEmail ? (takingLong ? 'Connecting Securely…' : 'Signing In…') : 'Sign In & Enter Sanctuary →'}
          </Button>

          {loadingEmail && takingLong && (
            <p className="mt-2 text-center text-xs text-ink-3 animate-pulse font-util tracking-wide">
              Connecting securely to Dev Creation…
            </p>
          )}
        </form>
      )}

      {/* Footer link to Register */}
      <div className="mt-8 border-t border-line/80 pt-6 text-center text-xs sm:text-sm text-body">
        <span>New to Dev Creation? </span>
        <Link href="/register" className="font-semibold text-gold-dk hover:text-ink underline transition-colors">
          Create an artisanal account
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/products"
          className="font-util text-[0.68rem] uppercase tracking-widest text-ink-3 transition-colors hover:text-gold-dk"
        >
          &larr; Skip and browse collection as guest
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 flex items-center justify-center gap-4 border-t border-line/60 pt-5 text-[0.68rem] text-ink-3 font-util tracking-wider uppercase">
        <span className="flex items-center gap-1">
          <span>🌿</span> 100% Soy Wax
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span>🔒</span> 256-bit Secure
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span>🇮🇳</span> Handcrafted in India
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex bg-[#FAF7F2] text-ink selection:bg-gold/20 selection:text-gold-dk">
      {/* ======================================================== */}
      {/* Left Column: Editorial Atmospheric Brand Showcase (Desktop) */}
      {/* ======================================================== */}
      <section className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative overflow-hidden flex-col justify-between p-10 xl:p-14 text-white">
        {/* Background Visual */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/image2.jpg"
            alt="Dev Creation Artisanal Wax Sanctuary"
            fill
            priority
            className="object-cover object-center scale-105 transition-transform duration-10000"
          />
          {/* Multi-layered Editorial Scrim for Crisp Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/65 to-deep/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(184,148,63,0.25),transparent_50%)]" />
        </div>

        {/* Top Header Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-util text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-md transition-all hover:border-gold hover:bg-gold/20 hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">&larr;</span>
            <span>Return to Boutique</span>
          </Link>

          <span className="font-util text-[0.62rem] font-bold uppercase tracking-[0.22em] text-gold-lt/90">
            Dev Creation Sanctum
          </span>
        </div>

        {/* Center Editorial Storytelling */}
        <div className="relative z-10 my-auto py-12">
          <span className="inline-flex items-center gap-2 font-util text-[0.65rem] font-bold uppercase tracking-[0.24em] text-gold-lt">
            <span className="inline-block h-2 w-2 rounded-full bg-gold-lt animate-pulse" />
            Handcrafted Luxury Scent Bar
          </span>

          <h2 className="mt-4 font-display-alt text-3xl xl:text-4xl 2xl:text-5xl font-medium leading-[1.12] text-white">
            Handcrafted with love, <br />
            <span className="italic text-gold-lt">Scented with care.</span>
          </h2>

          <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-white/80">
            Step into an olfactory sanctuary where master perfumer oils and pure unbleached botanical soy wax harmonize to elevate your daily atmosphere.
          </p>

          {/* Member Privileges Highlight Cards */}
          <div className="mt-8 space-y-3 max-w-md">
            {[
              {
                icon: '✧',
                title: 'Secret Seasonal Drops & Private Sales',
                desc: 'Priority guestlist access to artisanal limited releases.',
              },
              {
                icon: '✦',
                title: 'Bespoke Fragrance Recommendations',
                desc: 'Curated wardrobe & living space aroma pairings.',
              },
              {
                icon: '✧',
                title: 'Live SMS Dispatch Tracking',
                desc: 'Real-time order updates delivered straight to your phone.',
              },
            ].map((perk, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:bg-white/10"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold/20 font-serif text-xs text-gold-lt">
                  {perk.icon}
                </span>
                <div>
                  <h4 className="font-util text-xs font-semibold uppercase tracking-wider text-white">
                    {perk.title}
                  </h4>
                  <p className="mt-0.5 text-[0.72rem] text-white/70">
                    {perk.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Craft Mark */}
        <div className="relative z-10 border-t border-white/15 pt-5 flex items-center justify-between text-[0.68rem] text-white/70 font-util tracking-widest uppercase">
          <span>Pure Soy Wax • IFRA Certified</span>
          <span className="text-gold-lt">Hand-Poured in India</span>
        </div>
      </section>

      {/* ======================================================== */}
      {/* Right Column: Luxury Authentication Form */}
      {/* ======================================================== */}
      <section className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Soft Ambient Background Glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-amber-600/5 blur-3xl" />

        <div className="w-full max-w-md mx-auto relative z-10">
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-6 flex items-center justify-between">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 font-util text-xs tracking-wider uppercase text-ink-3 hover:text-gold-dk transition-colors"
            >
              <span>&larr;</span>
              <span>Back to Boutique</span>
            </Link>
            <span className="font-util text-[0.62rem] font-bold uppercase tracking-widest text-gold-dk">
              Dev Creation
            </span>
          </div>

          {/* Luxury Card Container */}
          <div className="rounded-3xl border border-gold/30 bg-white/95 p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(44,24,16,0.08)] backdrop-blur-md transition-all">
            {/* Brand Header */}
            <div className="text-center mb-7">
              <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200">
                <Image
                  src="/assets/Logos/logo.jpeg"
                  alt="Dev Creation"
                  width={140}
                  height={70}
                  className="h-14 w-auto object-contain mx-auto"
                  priority
                />
              </Link>
              <h1 className="mt-4 font-display-alt text-2xl sm:text-3xl font-medium text-ink">
                Welcome to Dev Creation
              </h1>
              <p className="mt-1.5 text-xs text-body leading-relaxed max-w-xs mx-auto">
                Sign in to access your bespoke fragrances, wishlist, and private circle privileges.
              </p>
            </div>

            {/* Form */}
            <Suspense fallback={
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
              </div>
            }>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
