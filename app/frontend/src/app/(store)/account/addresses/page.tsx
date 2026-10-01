'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/Modal';
import type { Address, ShippingAddress } from '@/types';

const EMPTY: ShippingAddress & { isDefault: boolean } = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  isDefault: false,
};

export default function AddressesPage() {
  const { success, error } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get<Address[]>('/users/me/addresses')
      .then((res) => setAddresses(res.data))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/users/me/addresses', form);
      setForm({ ...EMPTY });
      success('Address added');
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
    <div>
      <h1 className="mb-6 font-display text-3xl font-medium text-ink">Addresses</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : addresses.length === 0 ? (
            <EmptyState title="No addresses saved" hint="Add one to speed up checkout." />
          ) : (
            <div className="space-y-3">
              {addresses.map((a) => (
                <div key={a._id} className="flex items-start justify-between gap-4 rounded-[10px] border border-line bg-surface p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display-alt text-lg text-ink">{a.fullName}</span>
                      {a.isDefault && <span className="tag-chip">Default</span>}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-2">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}, {a.country}
                      <br />
                      {a.phone}
                    </p>
                  </div>
                  <button onClick={() => setDeleteId(a._id)} className="font-util text-[0.58rem] uppercase tracking-[0.12em] text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={add} className="h-fit rounded-[10px] border border-line bg-surface p-6">
          <span className="util-label">Add a new address</span>
          <div className="mt-3 space-y-3">
            <Input placeholder="Full name" value={form.fullName} onChange={set('fullName')} required />
            <Input placeholder="Phone" value={form.phone} onChange={set('phone')} required />
            <Input placeholder="Address line 1" value={form.line1} onChange={set('line1')} required />
            <Input placeholder="Address line 2 (optional)" value={form.line2 ?? ''} onChange={set('line2')} />
            <Input placeholder="City" value={form.city} onChange={set('city')} required />
            <Input placeholder="State" value={form.state} onChange={set('state')} required />
            <Input placeholder="Postal code" value={form.postalCode} onChange={set('postalCode')} required />
            <Input placeholder="Country" value={form.country} onChange={set('country')} required />
            <label className="flex items-center gap-2 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
              />
              Set as default
            </label>
          </div>
          <Button type="submit" loading={saving} className="mt-4 w-full">
            Save address
          </Button>
        </form>
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete address?"
        message="This address will be permanently removed from your account."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[10px] border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-gold"
    />
  );
}
