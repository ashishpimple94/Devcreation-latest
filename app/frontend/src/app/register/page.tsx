'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { AuthShell } from '@/components/auth/AuthShell';

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const refreshCart = useCartStore((s) => s.refresh);
  const { error, success } = useToast();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      await refreshCart();
      success(`Welcome to Dev Creation, ${form.name}! Taking you to our collection…`);
      router.push('/products');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join Dev Creation to shop, save favourites and track orders.">
      <form onSubmit={onSubmit} className="w-full max-w-sm">
        <Field label="Full name" value={form.name} onChange={set('name')} required />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
        <Field label="Phone (optional)" value={form.phone} onChange={set('phone')} />
        <Field label="Password" type="password" value={form.password} onChange={set('password')} required />
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Create account
        </Button>
        <p className="mt-6 text-center text-sm text-body">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-gold hover:text-gold-dk">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="mb-4 block">
      <span className="util-label">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold"
      />
    </label>
  );
}
