'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import type { Address, ShippingAddress } from '@/types';

const EMPTY: ShippingAddress & { isDefault: boolean } = {
  fullName: '', phone: '', line1: '', line2: '',
  city: '', state: '', postalCode: '', country: 'India', isDefault: false,
};

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
  'Ladakh','Lakshadweep','Puducherry',
];

export default function AddressesPage() {
  const { success, error } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api.get<Address[]>('/users/me/addresses')
      .then((res) => setAddresses(res.data))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setField = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users/me/addresses', form);
      setForm({ ...EMPTY });
      setShowForm(false);
      success('Address saved');
      load();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not add address');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/me/addresses/${deleteId}`);
      success('Address removed');
      load();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not remove');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold-dk">Account</p>
          <h1 className="font-display text-3xl font-medium text-ink">Addresses</h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 font-util text-xs font-bold uppercase tracking-wider transition-all duration-200',
            showForm
              ? 'border border-line bg-surface text-ink-3 hover:bg-surface-2'
              : 'bg-deep text-white hover:bg-[#3D2A1E] shadow-xs',
          )}
        >
          {showForm ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Address
            </>
          )}
        </button>
      </div>

      {/* Add address form */}
      {showForm && (
        <div className="rounded-2xl border border-gold/30 bg-gold/[0.03] p-6 shadow-xs">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-util text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ink-3">New Address</span>
          </div>
          <form onSubmit={add} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AddrField label="Full Name" placeholder="Priya Sharma" value={form.fullName} onChange={setField('fullName')} required />
              <AddrField label="Phone Number" placeholder="9876543210" value={form.phone} onChange={setField('phone')} required />
            </div>
            <AddrField label="Address Line 1" placeholder="Flat No., Building, Street" value={form.line1} onChange={setField('line1')} required />
            <AddrField label="Address Line 2" placeholder="Landmark, Colony (optional)" value={form.line2 ?? ''} onChange={setField('line2')} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AddrField label="City" placeholder="Mumbai" value={form.city} onChange={setField('city')} required />
              <div>
                <label className="mb-1.5 block font-util text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-3">State</label>
                <div className="relative">
                  <select
                    required
                    value={form.state}
                    onChange={setField('state')}
                    className="luxury-select w-full cursor-pointer rounded-xl border border-line bg-surface px-3.5 py-3 pr-9 text-sm text-ink outline-none transition-all duration-200 hover:border-gold/50 focus:border-gold focus:ring-2 focus:ring-gold/15"
                  >
                    <option value="">Select…</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <AddrField label="Postal Code" placeholder="400001" value={form.postalCode} onChange={setField('postalCode')} required />
            </div>
            <label className="flex cursor-pointer items-center gap-2.5">
              <div className={cn(
                'relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
                form.isDefault ? 'border-gold bg-gold' : 'border-line bg-surface',
              )}>
                {form.isDefault && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="absolute inset-0 cursor-pointer opacity-0" />
              </div>
              <span className="text-sm text-ink-2">Set as my default delivery address</span>
            </label>
            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={saving} className="flex-1">Save Address</Button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-line py-3 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 text-3xl">📍</span>
          <div>
            <p className="font-display-alt text-xl font-medium text-ink">No addresses saved</p>
            <p className="mt-1 text-sm text-ink-3">Add an address to speed up checkout.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary px-7 py-2.5 text-xs">Add First Address</button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a._id} className="group flex items-start justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4 transition-all duration-200 hover:border-gold/40 hover:shadow-xs">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-3 transition-colors group-hover:bg-gold/10 group-hover:text-gold-dk">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display-alt text-[1.05rem] font-semibold text-ink">{a.fullName}</span>
                    {a.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 font-util text-[0.58rem] font-bold uppercase tracking-wider text-gold-dk">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-3">
                    {a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />
                    {a.city}, {a.state} – {a.postalCode}<br />
                    <span className="font-medium text-ink-2">{a.phone}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteId(a._id)}
                className="shrink-0 rounded-lg px-2.5 py-1.5 font-util text-[0.6rem] uppercase tracking-wider text-red-400 opacity-0 transition-all duration-200 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Remove address?"
        message="This address will be permanently deleted from your account."
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function AddrField({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1.5 block font-util text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</label>
      <input
        {...rest}
        className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink outline-none transition-all duration-200 hover:border-gold/40 focus:border-gold focus:ring-2 focus:ring-gold/15 disabled:opacity-50"
      />
    </div>
  );
}
