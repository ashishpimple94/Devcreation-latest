'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/admin.service';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { Button, Spinner, EmptyState } from '@/components/ui';
import { formatRupee, formatDateTime, cn } from '@/lib/utils';
import type { GiftCard } from '@/types';

export default function GiftCardsPage() {
  const { success, error } = useToast();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [minOrderValue, setMinOrderValue] = useState<number | ''>('');
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [usageLimit, setUsageLimit] = useState<number | ''>('');
  const [expiresAt, setExpiresAt] = useState('');

  const loadCards = useCallback(() => {
    setLoading(true);
    adminService
      .listGiftCards()
      .then((data) => setCards(data || []))
      .catch((err) => error(err instanceof Error ? err.message : 'Failed to load gift cards'))
      .finally(() => setLoading(false));
  }, [error]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      error('Please enter a valid code');
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      error('Discount value must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createGiftCard({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: minOrderValue ? Number(minOrderValue) : 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });

      success(`Gift card ${code.toUpperCase()} created successfully!`);
      setIsModalOpen(false);
      resetForm();
      loadCards();
    } catch (err) {
      error(err instanceof Error ? err.message : 'Could not create gift card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    setActionLoadingId(id);
    try {
      const updated = await adminService.toggleGiftCard(id);
      setCards((prev) => prev.map((c) => (c._id === id ? updated : c)));
      success(`Card ${updated.code} is now ${updated.isActive ? 'Active' : 'Inactive'}`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to toggle status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: string, cardCode: string) => {
    if (!confirm(`Are you sure you want to permanently delete code ${cardCode}?`)) {
      return;
    }
    setActionLoadingId(id);
    try {
      await adminService.deleteGiftCard(id);
      setCards((prev) => prev.filter((c) => c._id !== id));
      success(`Gift card ${cardCode} deleted`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Failed to delete gift card');
    } finally {
      setActionLoadingId(null);
    }
  };

  const resetForm = () => {
    setCode('');
    setDescription('');
    setDiscountType('flat');
    setDiscountValue('');
    setMinOrderValue('');
    setMaxDiscount('');
    setUsageLimit('');
    setExpiresAt('');
  };

  // Stats calculation
  const totalCodes = cards.length;
  const activeCodes = cards.filter((c) => c.isActive).length;
  const totalRedemptions = cards.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Gift Cards & Promo Codes
          </h1>
          <p className="mt-1 text-xs text-ink-3">
            Create and manage promotional discount vouchers, gift cards, and seasonal redeem codes.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="btn-primary inline-flex items-center gap-2 self-start rounded-lg px-4 py-2.5 text-xs tracking-wider uppercase font-util"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create New Code
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">Total Codes</span>
          <div className="mt-2 font-display text-2xl font-semibold text-ink">{totalCodes}</div>
          <p className="mt-1 text-xs text-ink-3">All configured gift vouchers</p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">Active Campaigns</span>
          <div className="mt-2 font-display text-2xl font-semibold text-forest">{activeCodes}</div>
          <p className="mt-1 text-xs text-ink-3">Currently redeemable by shoppers</p>
        </div>

        <div className="rounded-xl border border-line bg-white p-5 shadow-sm">
          <span className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3">Total Redemptions</span>
          <div className="mt-2 font-display text-2xl font-semibold text-copper">{totalRedemptions}</div>
          <p className="mt-1 text-xs text-ink-3">Successful customer orders applied</p>
        </div>
      </div>

      {/* Codes Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-display text-base font-medium text-ink">Active & Inactive Codes</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-6 w-6 text-gold" />
          </div>
        ) : cards.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No gift cards created yet"
              hint="Generate promo codes like WELCOME10 or DEV100 to reward your customers."
              action={
                <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-3 text-xs">
                  Create First Code
                </button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2 font-util text-[0.62rem] uppercase tracking-wider text-ink-3">
                <tr>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Discount</th>
                  <th className="px-6 py-3.5">Min Order</th>
                  <th className="px-6 py-3.5">Redeemed</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {cards.map((card) => {
                  const isLoading = actionLoadingId === card._id;
                  return (
                    <tr key={card._id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1 font-mono text-xs font-bold text-ink uppercase tracking-wider">
                          {card.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-ink-2 max-w-xs truncate" title={card.description}>
                        {card.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-ink">
                        {card.discountType === 'flat' ? (
                          <span className="text-copper font-semibold">{formatRupee(card.discountValue)} FLAT</span>
                        ) : (
                          <span className="text-forest font-semibold">
                            {card.discountValue}% OFF
                            {card.maxDiscount ? ` (Up to ${formatRupee(card.maxDiscount)})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-ink-2">
                        {card.minOrderValue > 0 ? formatRupee(card.minOrderValue) : 'No min'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-ink">
                        {card.usedCount}
                        <span className="text-ink-3">
                          {card.usageLimit ? ` / ${card.usageLimit}` : ' (Unlimited)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 font-util text-[0.6rem] font-semibold uppercase tracking-wider',
                            card.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200',
                          )}
                        >
                          {card.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggle(card._id)}
                          disabled={isLoading}
                          className="rounded px-2.5 py-1 font-util text-[0.62rem] uppercase tracking-wider border border-line text-ink hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
                        >
                          {card.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(card._id, card.code)}
                          disabled={isLoading}
                          className="rounded px-2.5 py-1 font-util text-[0.62rem] uppercase tracking-wider border border-line text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Gift Card / Promo Code"
        className="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
              Code Name *
            </label>
            <input
              type="text"
              placeholder="e.g. SUMMER25, FESTIVE200"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm uppercase tracking-wider text-ink outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
              Description *
            </label>
            <input
              type="text"
              placeholder="e.g. Flat ₹200 off on festive candle sets"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'flat' | 'percentage')}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              >
                <option value="flat">Flat Amount (₹)</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>

            <div>
              <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                min="1"
                placeholder={discountType === 'flat' ? '₹ amount' : '% percentage'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value ? Number(e.target.value) : '')}
                required
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                Minimum Order (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0 = No minimum"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>

            {discountType === 'percentage' ? (
              <div>
                <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                  Max Discount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Optional cap"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </div>
            ) : (
              <div>
                <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Empty = Unlimited"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {discountType === 'percentage' && (
              <div>
                <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Empty = Unlimited"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
                />
              </div>
            )}

            <div>
              <label className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 block mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-ghost px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <Button
              type="submit"
              loading={submitting}
              className="px-5 py-2 text-xs uppercase font-util tracking-wider"
            >
              Create Code
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
