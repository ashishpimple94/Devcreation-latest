'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { AuthShell } from '@/components/auth/AuthShell';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isStaff = useAuthStore((s) => s.isStaff);
  const logout = useAuthStore((s) => s.logout);
  const refreshCart = useCartStore((s) => s.refresh);
  const refreshNotifications = useNotificationStore((s) => s.refresh);
  const { error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      // Staff accounts belong to the admin panel, not the storefront.
      if (isStaff()) {
        await logout();
        error('Staff accounts must sign in through the admin panel');
        return;
      }
      await Promise.all([refreshCart(), refreshNotifications()]);
      const redirect = params.get('redirect');
      router.push(redirect ?? '/account/profile');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <label className="mb-4 block">
        <span className="util-label">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <label className="mb-2 block">
        <span className="util-label">Password</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold"
        />
      </label>
      <Link href="/forgot-password" className="mb-6 block text-right font-util text-[0.6rem] uppercase tracking-[0.12em] text-gold hover:text-gold-dk">
        Forgot password?
      </Link>
      <Button type="submit" loading={loading} className="w-full">
        Log in
      </Button>
      <p className="mt-6 text-center text-sm text-body">
        New here?{' '}
        <Link href="/register" className="font-medium text-gold hover:text-gold-dk">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your fragrance journey.">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
