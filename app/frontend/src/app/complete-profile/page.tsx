'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { AuthShell } from '@/components/auth/AuthShell';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

function CompleteProfileForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get('phone') || '';

  const completeProfile = useAuthStore((s) => s.completeProfile);
  const status = useAuthStore((s) => s.status);
  const refreshCart = useCartStore((s) => s.refresh);
  const refreshNotifications = useNotificationStore((s) => s.refresh);
  const { error, success } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'account' | 'address'>('account');

  // Guard — if not authenticated (no OTP was done) send to login
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const handleAccountNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      error('Password must be at least 8 characters');
      return;
    }
    setStep('address');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      error('Please enter a valid 6-digit pincode');
      return;
    }
    if (!state) {
      error('Please select your state');
      return;
    }

    setLoading(true);
    try {
      await completeProfile({
        name: name.trim(),
        email: email.trim(),
        password,
        address: { line1, line2: line2 || undefined, city, state, pincode },
      });

      refreshCart().catch(() => {});
      refreshNotifications().catch(() => {});
      success(`Welcome to Dev Creation, ${name.split(' ')[0]}! 🎉`);
      router.push('/products');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not save your profile. Please try again.');
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold placeholder:text-ink-3/60';
  const labelCls = 'block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-2 mb-1.5';

  return (
    <div className="w-full max-w-md">
      {/* Phone display */}
      <div className="mb-6 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm">
        <span>📱</span>
        <span className="text-ink-2">Registered mobile:</span>
        <span className="font-semibold text-ink">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex gap-2">
        {(['account', 'address'] as const).map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step === s
                  ? 'bg-gold text-white'
                  : i < (step === 'address' ? 1 : 0)
                  ? 'bg-green-500 text-white'
                  : 'bg-line text-ink-3'
              }`}
            >
              {i < (step === 'address' ? 1 : 0) ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step === s ? 'text-ink' : 'text-ink-3'}`}>
              {s === 'account' ? 'Account' : 'Address'}
            </span>
            {i === 0 && <div className="flex-1 h-px bg-line" />}
          </div>
        ))}
      </div>

      {step === 'account' ? (
        <form onSubmit={handleAccountNext} className="space-y-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={inputCls}
            />
            <p className="mt-1.5 text-[0.65rem] text-ink-3">Used for order confirmations and receipts.</p>
          </div>

          <div>
            <label className={labelCls}>Create Password</label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className={`${inputCls} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-xs font-semibold text-ink-3 hover:text-ink"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className={inputCls}
            />
          </div>

          <Button type="submit" className="w-full">
            Continue to Address →
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Address Line 1</label>
            <input
              type="text"
              required
              autoComplete="address-line1"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="Flat / House No., Street, Area"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Address Line 2 <span className="normal-case font-normal text-ink-3">(optional)</span></label>
            <input
              type="text"
              autoComplete="address-line2"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="Landmark, Colony"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>City</label>
              <input
                type="text"
                required
                autoComplete="address-level2"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Pincode</label>
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="400001"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>State</label>
            <div className="relative">
              <select
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`luxury-select ${inputCls} cursor-pointer pr-10`}
              >
                <option value="">Select state…</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('account')}
              className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-2"
            >
              ← Back
            </button>
            <Button type="submit" loading={loading} className="flex-1 py-3">
              {loading ? 'Saving…' : 'Complete & Enter Store'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <AuthShell
      title="Complete Your Profile"
      subtitle="One quick step — set up your account details and delivery address."
    >
      <Suspense fallback={null}>
        <CompleteProfileForm />
      </Suspense>
    </AuthShell>
  );
}
