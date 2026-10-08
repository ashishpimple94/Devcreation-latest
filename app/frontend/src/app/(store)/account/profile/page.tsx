'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { formatDate, formatRupee, cn } from '@/lib/utils';
import type { User, Order, Address, Product, PageMeta } from '@/types';

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Boutique Master',
  admin: 'Concierge Lead',
  manager: 'Artisan Curator',
  customer: 'Fragrance Member',
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

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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

  // Pull stats & recent orders
  useEffect(() => {
    let active = true;
    setLoadingOrders(true);

    Promise.allSettled([
      api.get<Order[]>('/orders?limit=3'),
      api.get<Product[]>('/users/me/wishlist'),
      api.get<Address[]>('/users/me/addresses'),
    ]).then((results) => {
      if (!active) return;
      const [ordersRes, wishlistRes, addressesRes] = results;

      if (ordersRes.status === 'fulfilled') {
        const orderData = ordersRes.value.data || [];
        setRecentOrders(orderData);
        setStats((prev) => ({
          ...prev,
          orders: (ordersRes.value.meta as PageMeta | undefined)?.total ?? orderData.length,
        }));
      }

      if (wishlistRes.status === 'fulfilled') {
        setStats((prev) => ({ ...prev, wishlist: wishlistRes.value.data?.length || 0 }));
      }

      if (addressesRes.status === 'fulfilled') {
        setStats((prev) => ({ ...prev, addresses: addressesRes.value.data?.length || 0 }));
      }

      setLoadingOrders(false);
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
      success('Profile details saved successfully');
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
      success('Password changed successfully');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Password update failed');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Luxury Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
        <div className="h-28 bg-gradient-to-r from-deep via-[#3D2A1E] to-copper" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-12 flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 border-surface bg-gold font-display text-2xl font-semibold text-white shadow-card">
            {initials}
          </div>
          <div className="flex flex-1 flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-medium leading-tight text-ink">{user?.name}</h1>
              </div>
              <p className="text-xs text-ink-3 mt-0.5">{user?.email} {user?.phone && `· +91 ${user.phone}`}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 font-util text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-dk">
                {ROLE_LABEL[user?.role ?? 'customer'] ?? 'Fragrance Member'}
              </span>
              {user?.createdAt && (
                <span className="rounded-full border border-line px-3 py-1 font-util text-[0.58rem] uppercase tracking-[0.12em] text-ink-3">
                  Member Since {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fragrance Member Perks Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-ink">
        <div className="flex items-center gap-3 px-2">
          <span className="text-2xl">🕯️</span>
          <div>
            <div className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">Pure Soy Wax</div>
            <div className="text-xs text-ink-2">Handcrafted luxury sachets & scents</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 border-t sm:border-t-0 sm:border-l border-line/50 pt-2 sm:pt-0">
          <span className="text-2xl">🚚</span>
          <div>
            <div className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">Free Pan-India Delivery</div>
            <div className="text-xs text-ink-2">On all orders above ₹999</div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-2 border-t sm:border-t-0 sm:border-l border-line/50 pt-2 sm:pt-0">
          <span className="text-2xl">🎁</span>
          <div>
            <div className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">Artisan Fragrance Care</div>
            <div className="text-xs text-ink-2">Private sales & secret drops</div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Navigation to Shop */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="util-label text-gold-dk">Customer Hub · Quick Actions</span>
          <Link
            href="/products"
            className="font-util text-xs font-semibold uppercase tracking-wider text-gold hover:text-gold-dk underline"
          >
            Explore Entire Collection &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/products"
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 p-4 text-center transition-all hover:-translate-y-0.5 hover:bg-gold hover:text-white group"
          >
            <span className="text-2xl">🛍️</span>
            <span className="font-util text-xs font-bold uppercase tracking-wider group-hover:text-white text-gold-dk">
              Shop Collection
            </span>
          </Link>
          <Link
            href="/account/orders"
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-white group"
          >
            <span className="text-2xl">📦</span>
            <span className="font-util text-xs font-semibold uppercase tracking-wider text-ink-2 group-hover:text-ink">
              My Orders ({stats.orders})
            </span>
          </Link>
          <Link
            href="/account/wishlist"
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-white group"
          >
            <span className="text-2xl">❤️</span>
            <span className="font-util text-xs font-semibold uppercase tracking-wider text-ink-2 group-hover:text-ink">
              Wishlist ({stats.wishlist})
            </span>
          </Link>
          <Link
            href="/account/addresses"
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-gold hover:bg-white group"
          >
            <span className="text-2xl">📍</span>
            <span className="font-util text-xs font-semibold uppercase tracking-wider text-ink-2 group-hover:text-ink">
              Addresses ({stats.addresses})
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <span className="util-label">Recent Orders</span>
          {recentOrders.length > 0 && (
            <Link
              href="/account/orders"
              className="font-util text-xs font-medium uppercase tracking-wider text-gold hover:text-gold-dk"
            >
              View All ({stats.orders})
            </Link>
          )}
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center font-util text-xs text-ink-3">Loading order history…</div>
        ) : recentOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center">
            <span className="text-3xl">🕯️</span>
            <p className="mt-2 font-display text-lg font-medium text-ink">No orders placed yet</p>
            <p className="mt-1 text-xs text-ink-3">Explore our aromatic soy wax collection and place your first order.</p>
            <Link href="/products" className="btn-primary mt-4 inline-block px-5 py-2 text-xs">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recentOrders.map((order) => (
              <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-ink">#{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-1 text-xs text-ink-3">
                    {order.items?.length || 0} item(s) · Total: <strong className="text-ink">{formatRupee(order.total)}</strong>
                  </div>
                </div>
                <Link
                  href={`/account/orders/detail?id=${order.orderNumber || order._id}`}
                  className="rounded-lg border border-line bg-white px-3.5 py-1.5 font-util text-xs font-semibold uppercase tracking-wider text-ink-2 hover:border-gold hover:text-gold transition-colors"
                >
                  View Details &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Form & Password Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <span className="util-label">Personal Information</span>
            {dirty && <span className="font-util text-[0.6rem] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Unsaved Changes</span>}
          </div>
          <div className="space-y-4">
            <Field label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Field label="Email Address" value={user?.email ?? ''} disabled hint="Email address is associated with your account" />
            <Field label="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" hint="Used for OTP login & delivery dispatch updates" />
          </div>
          <Button type="submit" loading={savingProfile} disabled={!dirty} className="mt-6 w-full">
            Save Profile Details
          </Button>
        </form>

        <form onSubmit={changePassword} className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
          <span className="util-label">Security & Password</span>
          <div className="mt-4 space-y-4">
            <Field label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••" />
            <div>
              <Field label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Minimum 8 characters" />
              {newPassword && <StrengthMeter score={pwStrength} />}
            </div>
          </div>
          <Button type="submit" variant="ghost" loading={savingPw} className="mt-6 w-full border border-line">
            Update Password
          </Button>
        </form>
      </div>
    </div>
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
      <span className="util-label mb-1.5 block">{label}</span>
      <input
        {...rest}
        className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold disabled:opacity-60"
      />
      {hint && <span className="mt-1 block text-[0.7rem] text-ink-3">{hint}</span>}
    </label>
  );
}
