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
  super_admin: 'Super Administrator',
  admin: 'Store Admin',
  manager: 'Artisan Curator',
  customer: 'Fragrance Member',
};

const QUICK_ACTIONS = [
  {
    href: '/products',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    label: 'Shop Collection',
    accent: true,
    stat: null,
  },
  {
    href: '/account/orders',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="m8 21 4-4 4 4" /><path d="M2 10h20" />
      </svg>
    ),
    label: 'My Orders',
    accent: false,
    stat: 'orders' as const,
  },
  {
    href: '/account/wishlist',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    label: 'Wishlist',
    accent: false,
    stat: 'wishlist' as const,
  },
  {
    href: '/account/addresses',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'Addresses',
    accent: false,
    stat: 'addresses' as const,
  },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 });

  useEffect(() => {
    if (user) { setName(user.name); setPhone(user.phone ?? ''); }
  }, [user]);

  useEffect(() => {
    let active = true;
    setLoadingOrders(true);
    Promise.allSettled([
      api.get<Order[]>('/orders?limit=3'),
      api.get<Product[]>('/users/me/wishlist'),
      api.get<Address[]>('/users/me/addresses'),
    ]).then(([ordersRes, wishlistRes, addressesRes]) => {
      if (!active) return;
      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value.data || [];
        setRecentOrders(d);
        setStats((p) => ({ ...p, orders: (ordersRes.value.meta as PageMeta | undefined)?.total ?? d.length }));
      }
      if (wishlistRes.status === 'fulfilled') setStats((p) => ({ ...p, wishlist: wishlistRes.value.data?.length || 0 }));
      if (addressesRes.status === 'fulfilled') setStats((p) => ({ ...p, addresses: addressesRes.value.data?.length || 0 }));
      setLoadingOrders(false);
    });
    return () => { active = false; };
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return 'DC';
    return user.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }, [user?.name]);

  const dirty = user ? name !== user.name || phone !== (user.phone ?? '') : false;

  const pwStrength = useMemo(() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) s++;
    if (/\d/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  }, [newPassword]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch<User>('/users/me', { name, phone: phone || undefined });
      setUser(res.data);
      success('Profile saved');
    } catch (err) { error(err instanceof Error ? err.message : 'Update failed'); }
    finally { setSavingProfile(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { error('Password must be at least 8 characters'); return; }
    setSavingPw(true);
    try {
      await api.post('/users/me/change-password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setShowPwForm(false);
      success('Password updated');
    } catch (err) { error(err instanceof Error ? err.message : 'Password update failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="space-y-6">

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
        {/* Cover */}
        <div className="relative h-36 overflow-hidden bg-gradient-to-r from-deep via-[#3D2A1E] to-copper">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute left-1/4 top-4 h-28 w-48 rounded-full bg-copper/25 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, #E0C280 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="group relative -mt-14 flex-shrink-0">
            <div className="pointer-events-none absolute inset-0 scale-110 rounded-full bg-gold/25 blur-lg animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-gradient-to-br from-deep to-[#3D2A1E] shadow-[0_8px_32px_rgba(44,24,16,0.4)] ring-2 ring-gold/60">
              <span className="select-none font-util text-3xl font-bold tracking-tight text-white">{initials}</span>
            </div>
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-surface bg-emerald-500" />
          </div>

          <div className="flex flex-1 flex-wrap items-end justify-between gap-3 pb-1">
            <div>
              <h1 className="font-display text-[1.9rem] font-medium leading-tight text-ink">{user?.name}</h1>
              <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
                <span>{user?.email}</span>
                {user?.phone && <><span className="opacity-40">·</span><span>+91 {user.phone}</span></>}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 font-util text-[0.62rem] font-bold uppercase tracking-[0.16em] text-gold-dk">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                {ROLE_LABEL[user?.role ?? 'customer'] ?? 'Fragrance Member'}
              </span>
              {user?.createdAt && (
                <span className="rounded-full border border-line px-3 py-1 font-util text-[0.58rem] uppercase tracking-[0.12em] text-ink-3">
                  Since {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Member Perks Strip ── */}
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gold/25 bg-gold/10 sm:grid-cols-3">
        {[
          { icon: '🕯️', title: 'Pure Soy Wax', body: 'Handcrafted botanical sachets & scents' },
          { icon: '🚚', title: 'Express Pan-India', body: 'Insured door-to-door delivery' },
          { icon: '🎁', title: 'Artisan Care', body: 'Private sales & exclusive drops' },
        ].map((p) => (
          <div key={p.title} className="flex items-center gap-3.5 bg-surface/70 px-5 py-4 backdrop-blur-sm">
            <span className="text-2xl">{p.icon}</span>
            <div>
              <p className="font-util text-[0.62rem] font-bold uppercase tracking-wider text-copper">{p.title}</p>
              <p className="text-xs text-ink-3">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Action Cards ── */}
      <SectionCard
        title="Quick Actions"
        label="Customer Hub"
        action={<Link href="/products" className="font-util text-[0.65rem] uppercase tracking-wider text-gold transition-colors hover:text-gold-dk">All Products →</Link>}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((qa) => (
            <Link
              key={qa.href}
              href={qa.href}
              className={cn(
                'group flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-card-hover',
                qa.accent
                  ? 'border-gold/50 bg-gold/10 hover:bg-gold hover:border-gold'
                  : 'border-line bg-surface-2 hover:border-gold/60 hover:bg-white',
              )}
            >
              <span className={cn(
                'flex h-11 w-11 items-center justify-center rounded-2xl transition-colors duration-200',
                qa.accent ? 'bg-gold/20 text-gold-dk group-hover:bg-white/20 group-hover:text-white' : 'bg-surface-3 text-ink-2 group-hover:bg-gold/15 group-hover:text-gold-dk',
              )}>
                {qa.icon}
              </span>
              <span className={cn(
                'font-util text-[0.66rem] font-bold uppercase leading-tight tracking-wider transition-colors duration-200',
                qa.accent ? 'text-gold-dk group-hover:text-white' : 'text-ink-2 group-hover:text-ink',
              )}>
                {qa.label}
                {qa.stat && stats[qa.stat] > 0 && (
                  <span className="ml-1 font-normal opacity-70">({stats[qa.stat]})</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </SectionCard>

      {/* ── Recent Orders ── */}
      <SectionCard
        title="Recent Orders"
        label="Order History"
        action={
          recentOrders.length > 0
            ? <Link href="/account/orders" className="font-util text-[0.65rem] uppercase tracking-wider text-gold transition-colors hover:text-gold-dk">View all ({stats.orders})</Link>
            : undefined
        }
      >
        {loadingOrders ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-surface-3/60" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-12 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-3xl">🕯️</span>
            <p className="font-display-alt text-lg font-medium text-ink">No orders yet</p>
            <p className="text-xs text-ink-3">Explore our aromatic soy wax collection.</p>
            <Link href="/products" className="btn-primary mt-1 px-6 py-2 text-xs">Browse Collection</Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((order) => (
              <div key={order._id} className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface-2/60 px-4 py-3.5 transition-all duration-200 hover:border-gold/50 hover:bg-white hover:shadow-xs">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-util text-[0.75rem] font-bold text-ink">#{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-[0.72rem] text-ink-3">
                    {order.items?.length || 0} item(s) · <strong className="font-semibold text-ink">{formatRupee(order.total)}</strong>
                    {order.createdAt && <span className="ml-2 opacity-60">· {formatDate(order.createdAt)}</span>}
                  </p>
                </div>
                <Link
                  href={`/account/orders/detail?id=${order.orderNumber || order._id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-1.5 font-util text-[0.62rem] font-semibold uppercase tracking-wider text-ink-2 transition-all duration-200 hover:border-gold hover:text-gold"
                >
                  Details
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Profile & Password Forms ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Personal Info */}
        <SectionCard title="Personal Information" label="Profile Details"
          action={dirty ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-amber-600">Unsaved</span> : undefined}
        >
          <form onSubmit={saveProfile} className="space-y-4">
            <ProfileField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
            />
            <ProfileField label="Email Address" value={user?.email ?? ''} disabled hint="Linked to your account — cannot be changed"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>}
            />
            <ProfileField label="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" hint="For OTP login & delivery updates"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" /><path d="M12 18h.01" /></svg>}
            />
            <Button type="submit" loading={savingProfile} disabled={!dirty} className="w-full">
              Save Changes
            </Button>
          </form>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security" label="Password"
          action={
            <button onClick={() => setShowPwForm((v) => !v)} className="font-util text-[0.65rem] uppercase tracking-wider text-gold transition-colors hover:text-gold-dk">
              {showPwForm ? 'Cancel' : 'Change password'}
            </button>
          }
        >
          {!showPwForm ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-line py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-3">
                  <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" />
                </svg>
              </span>
              <p className="text-sm text-ink-3">Your password is set and secure.</p>
              <button onClick={() => setShowPwForm(true)} className="btn-ghost px-6 py-2 text-xs">Change Password</button>
            </div>
          ) : (
            <form onSubmit={changePassword} className="space-y-4">
              <ProfileField label="Current Password" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="••••••••"
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>}
                toggle={() => setShowCurrent((v) => !v)} showToggle={showCurrent}
              />
              <div>
                <ProfileField label="New Password" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required placeholder="Min. 8 characters"
                  icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>}
                  toggle={() => setShowNew((v) => !v)} showToggle={showNew}
                />
                {newPassword && <StrengthMeter score={pwStrength} />}
              </div>
              <Button type="submit" loading={savingPw} className="w-full">Update Password</Button>
            </form>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────────────── */

function SectionCard({
  title, label, action, children,
}: {
  title: string; label: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface shadow-xs">
      <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          <span className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-3">{label}</span>
          <span className="font-display-alt text-[1.05rem] font-semibold text-ink">{title}</span>
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function ProfileField({
  label, hint, icon, toggle, showToggle, ...rest
}: {
  label: string;
  hint?: string;
  icon?: React.ReactNode;
  toggle?: () => void;
  showToggle?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block font-util text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</label>
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 text-ink-3">{icon}</span>
        )}
        <input
          {...rest}
          className={cn(
            'w-full rounded-xl border border-line bg-surface-2/50 py-3 pr-4 text-sm text-ink outline-none transition-all duration-200 focus:border-gold focus:bg-white focus:ring-2 focus:ring-gold/15 disabled:cursor-not-allowed disabled:opacity-50',
            icon ? 'pl-9' : 'pl-4',
          )}
        />
        {toggle && (
          <button type="button" onClick={toggle} className="absolute right-3.5 text-ink-3 transition-colors hover:text-ink">
            {showToggle ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[0.68rem] text-ink-3">{hint}</p>}
    </div>
  );
}

function StrengthMeter({ score }: { score: number }) {
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'];
  return (
    <div className="mt-2.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all duration-300', i < score ? colors[score] : 'bg-surface-3')} />
        ))}
      </div>
      <p className="mt-1 font-util text-[0.58rem] uppercase tracking-[0.12em] text-ink-3">{labels[score]}</p>
    </div>
  );
}
