'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { AuthShell } from '@/components/auth/AuthShell';
import { cn } from '@/lib/utils';

type LoginMode = 'otp' | 'email';

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

  // Pre-warm backend when login page opens
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lightseagreen-donkey-692988.hostingersite.com/api';
    fetch(`${apiUrl}/health`, { method: 'GET' }).catch(() => {});
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
      await loginWithOtp(clean, code);
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
      // Focus first digit box on error
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

      // Redirect smoothly to the Collection area
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
    <div className="w-full max-w-sm">
      {/* Mode Switcher Tabs */}
      <div className="mb-6 grid grid-cols-2 rounded-xl border border-line bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => setMode('otp')}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-util text-xs font-semibold uppercase tracking-wider transition-all',
            mode === 'otp'
              ? 'bg-white text-ink shadow-xs border border-line/50 font-bold'
              : 'text-ink-3 hover:text-ink',
          )}
        >
          <span>📱</span>
          <span>Mobile OTP</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('email')}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg py-2.5 font-util text-xs font-semibold uppercase tracking-wider transition-all',
            mode === 'email'
              ? 'bg-white text-ink shadow-xs border border-line/50 font-bold'
              : 'text-ink-3 hover:text-ink',
          )}
        >
          <span>✉️</span>
          <span>Email & Password</span>
        </button>
      </div>

      {mode === 'otp' ? (
        /* Mobile OTP Form */
        <div>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="util-label mb-1.5 block">Mobile Number</label>
                <div className="relative flex items-center rounded-xl border border-line bg-surface transition-colors focus-within:border-gold">
                  <span className="flex items-center gap-1 border-r border-line/80 px-3 py-3 font-util text-xs font-bold text-ink-2">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-ink-3/60"
                  />
                </div>
                <p className="mt-1.5 text-[0.65rem] text-ink-3">
                  We will send a 6-digit verification code to your phone.
                </p>
              </div>

              <Button type="submit" loading={sendingOtp} className="w-full">
                {sendingOtp ? 'Sending code…' : 'Send Verification Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="rounded-xl border border-gold/30 bg-gold/5 p-3.5 text-xs text-ink">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-2">Code sent via SMS to:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setUnverifiedTrialNotice(null);
                      setOtpDigits(['', '', '', '', '', '']);
                    }}
                    className="font-util text-[0.65rem] font-bold uppercase tracking-wider text-gold hover:text-gold-dk underline"
                  >
                    Change Number
                  </button>
                </div>
                <div className="mt-1 font-display text-base font-semibold text-ink">
                  +91 {phone.length === 10 ? `${phone.slice(0, 5)} ${phone.slice(5)}` : phone}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="util-label block">Enter 6-Digit Code</label>
                  <span className="font-util text-[0.62rem] text-ink-3">Auto-advances</span>
                </div>

                {/* 6-Cell Digit Input Grid */}
                <div className="grid grid-cols-6 gap-2">
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
                      value={otpDigits[index] || ''}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                      onPaste={handlePasteOtp}
                      autoFocus={index === 0}
                      className={cn(
                        'h-12 w-full rounded-xl border bg-surface text-center font-mono text-xl font-bold text-ink outline-none transition-all',
                        otpDigits[index]
                          ? 'border-gold bg-gold/5 shadow-xs'
                          : 'border-line focus:border-gold focus:ring-2 focus:ring-gold/20',
                      )}
                    />
                  ))}
                </div>

                <p className="mt-2 text-[0.68rem] text-ink-3 flex items-center gap-1.5">
                  <span>🔒</span>
                  <span>Code expires in 5 minutes. Never share this OTP with anyone.</span>
                </p>

                {/* Notice when using random unverified numbers with a Twilio trial account */}
                {unverifiedTrialNotice && (
                  <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50/90 p-3 text-xs text-amber-900">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>ℹ️</span>
                      <span>Twilio Trial Account Notice</span>
                    </div>
                    <p className="mt-1 text-[0.72rem] leading-relaxed text-amber-800">
                      Twilio free trial only delivers live SMS to your pre-verified number (<strong>+91 9090385555</strong>).
                      For other numbers, test code is: <strong className="font-mono text-xs text-ink bg-white px-1.5 py-0.5 rounded border border-amber-300">{unverifiedTrialNotice}</strong> (or master code <strong className="font-mono">123456</strong>).
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const d = unverifiedTrialNotice.split('');
                        setOtpDigits(d);
                        submitOtpVerification(unverifiedTrialNotice);
                      }}
                      className="mt-2 text-[0.65rem] font-bold uppercase tracking-wider text-amber-950 underline hover:text-black flex items-center gap-1"
                    >
                      <span>Auto-fill {unverifiedTrialNotice} &amp; Sign In</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                {countdown > 0 ? (
                  <span className="font-util text-[0.68rem] text-ink-3">
                    Resend code in <strong className="text-gold-dk">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={sendingOtp}
                    className="font-util text-[0.68rem] font-bold uppercase tracking-wider text-gold hover:text-gold-dk underline"
                  >
                    Resend SMS Code
                  </button>
                )}
              </div>

              <Button
                type="submit"
                loading={verifyingOtp}
                disabled={otpDigits.join('').length !== 6 || verifyingOtp}
                className="w-full"
              >
                {verifyingOtp ? 'Verifying Code…' : 'Verify & Enter Collection'}
              </Button>
            </form>
          )}
        </div>
      ) : (
        /* Email & Password Form */
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="util-label mb-1.5 block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold"
            />
          </div>

          <div>
            <label className="util-label mb-1.5 block">Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-xs text-ink-3 hover:text-ink p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="font-util text-[0.62rem] font-medium uppercase tracking-[0.12em] text-gold hover:text-gold-dk"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loadingEmail} className="w-full">
            {loadingEmail ? (takingLong ? 'Connecting…' : 'Signing in…') : 'Sign In & Enter Collection'}
          </Button>

          {loadingEmail && takingLong && (
            <p className="mt-2 text-center text-xs text-ink-3 animate-pulse font-util tracking-wide">
              Connecting securely to Dev Creation…
            </p>
          )}
        </form>
      )}

      {/* Footer link to Register */}
      <div className="mt-8 border-t border-line pt-6 text-center text-sm text-body">
        <span>New to Dev Creation? </span>
        <Link href="/register" className="font-semibold text-gold hover:text-gold-dk underline">
          Create an account
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/products"
          className="font-util text-[0.65rem] uppercase tracking-widest text-ink-3 transition-colors hover:text-gold"
        >
          &larr; Skip and browse collection as guest
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome to Dev Creation"
      subtitle="Sign in via mobile OTP or email to explore our artisanal collection."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
