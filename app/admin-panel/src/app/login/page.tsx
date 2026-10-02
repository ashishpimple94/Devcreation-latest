'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isStaff = useAuthStore((s) => s.isStaff);
  const logout = useAuthStore((s) => s.logout);
  const refreshNotifications = useNotificationStore((s) => s.refresh);
  const { error, success } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-warm backend when login page opens so cold-start delay is eliminated
  useEffect(() => {
    fetch('https://devcreation1.onrender.com/api/health', { method: 'GET' }).catch(() => {});
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);

      // Only staff may use the admin panel.
      if (!isStaff()) {
        await logout();
        error('This account does not have admin access');
        setLoading(false);
        return;
      }

      success('Welcome back!');
      // Refresh notifications in background - do NOT block navigation!
      refreshNotifications().catch(() => {});
      router.push('/dashboard');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center">
          <Image src="/assets/Logos/logo.jpeg" alt="Dev Creation" width={120} height={60} className="h-14 w-auto object-contain" priority />
          <span className="mt-3 font-util text-[0.55rem] uppercase tracking-[0.2em] text-copper">Admin Panel</span>
        </div>
        <h1 className="text-center font-display-alt text-2xl font-medium text-ink">Sign in</h1>
        <p className="mb-6 mt-1 text-center text-sm text-ink-3">Staff access only.</p>

        <form onSubmit={onSubmit}>
          <label className="mb-4 block">
            <span className="util-label">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
          <label className="mb-6 block">
            <span className="util-label">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
