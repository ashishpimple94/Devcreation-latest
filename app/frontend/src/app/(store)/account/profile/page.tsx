'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { formatDate, cn } from '@/lib/utils';
import type { User, Order, Address, Product, PageMeta } from '@/types';

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  customer: 'Member',
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const [stats, setStats] = useState<{ orders: number; wishlist: number; addresses: number }>({
    orders: 0,
    wishlist: 0,
    addresses: 0,
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  // Pull lightweight counts for the profile summary cards.
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      api.get<Order[]>('/orders?limit=1'),
      api.get<Product[]>('/users/me/wishlist'),
      api.get<Address[]>('/users/me/addresses'),
    ]).then((results) => {
      if (!active) return;
      const [orders, wishlist, addresses] = results;
      setStats({
        orders:
          orders.status === 'fulfilled'
            ? (orders.value.meta as PageMeta | undefined)?.total ?? orders.value.data.length
            : 0,
        wishlist: wishlist.status === 'fulfilled' ? wishlist.value.data.length : 0,
        addresses: addresses.status === 'fulfilled' ? addresses.value.data.length : 0,
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return 'DC';
    return user.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user?.name]);

  const dirty = user ? name !== user.name || phone !== (user.phone ?? '') : false;

  // Simple password strength meter (length + variety).
  const pwStrength = useMemo(() => {
    const v = newPassword;
    if (!v) return 0;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return score;
  }, [newPassword]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch<User>('/users/me', { name, phone: phone || undefined });
      setUser(res.data);
      success('Profile updated');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      error('New password must be at least 8 characters');
      return;
    }
    setSavingPw(true);
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      success('Password changed');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Change failed');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="relative overflow-hidden rounded-[14px] border border-line bg-surface">
        <div className="h-24 bg-gradient-to-r from-deep via-[#3D2A1E] to-copper" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-10 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-surface bg-gold font-display text-2xl font-medium text-white shadow-card">
            {initials}
          </div>
          <div className="flex flex-1 flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-medium leading-tight text-ink">{user?.name}</h1>
              <p className="text-sm text-ink-3">{user?.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/40 bg-[rgba(184,148,63,.08)] px-3 py-1 font-util text-[0.55rem] uppercase tracking-[0.14em] text-gold-dk">
                {ROLE_LABEL[user?.role ?? 'customer'] ?? 'Member'}
              </span>
              {user?.createdAt && (
                <span className="font-util text-[0.55rem] uppercase tracking-[0.12em] text-ink-3">
                  Since {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatLink href="/account/orders" label="Orders" value={stats.orders} />
        <StatLink href="/account/wishlist" label="Wishlist" value={stats.wishlist} />
        <StatLink href="/account/addresses" label="Addresses" value={stats.addresses} />
      </div>

      {/* Forms */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-[14px] border border-line bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="util-label">Account details</span>
            {dirty && <span className="font-util text-[0.55rem] uppercase tracking-[0.12em] text-copper">Unsaved</span>}
          </div>
          <div className="space-y-4">
            <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Field label="Email" value={user?.email ?? ''} disabled hint="Email can't be changed" />
            <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add a contact number" />
          </div>
          <Button type="submit" loading={savingProfile} disabled={!dirty} className="mt-5 w-full">
            Save changes
          </Button>
        </form>

        <form onSubmit={changePassword} className="rounded-[14px] border border-line bg-surface p-6">
          <span className="util-label">Change password</span>
          <div className="mt-4 space-y-4">
            <Field label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <div>
              <Field label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              {newPassword && <StrengthMeter score={pwStrength} />}
            </div>
          </div>
          <Button type="submit" variant="ghost" loading={savingPw} className="mt-5 w-full">
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}

function StatLink({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link
      href={href}
      className="group rounded-[14px] border border-line bg-surface p-5 text-center transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-rule"
    >
      <div className="font-display text-3xl font-medium text-ink">{value}</div>
      <div className="mt-1 font-util text-[0.58rem] uppercase tracking-[0.16em] text-ink-3 group-hover:text-gold-dk">
        {label}
      </div>
    </Link>
  );
}

function StrengthMeter({ score }: { score: number }) {
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-green-500'];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i < score ? colors[score] : 'bg-surface-3')} />
        ))}
      </div>
      <span className="mt-1 block font-util text-[0.55rem] uppercase tracking-[0.12em] text-ink-3">{labels[score]}</span>
    </div>
  );
}

function Field({
  label,
  hint,
  ...rest
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="util-label">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-60"
      />
      {hint && <span className="mt-1 block text-[0.7rem] text-ink-3">{hint}</span>}
    </label>
  );
}
