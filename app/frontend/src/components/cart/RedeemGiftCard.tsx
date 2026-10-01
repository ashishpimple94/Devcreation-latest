'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { giftCardService } from '@/services/giftCard.service';
import { formatRupee, cn } from '@/lib/utils';
import { Spinner } from '@/components/ui';
import type { GiftCardInfo } from '@/types';

interface RedeemGiftCardProps {
  compact?: boolean;
  className?: string;
}

export function RedeemGiftCard({ compact = false, className = '' }: RedeemGiftCardProps) {
  const { cart, appliedGiftCard, applyGiftCard, removeGiftCard } = useCartStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [availableCodes, setAvailableCodes] = useState<GiftCardInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(!compact);

  useEffect(() => {
    giftCardService
      .getAvailable()
      .then((data) => setAvailableCodes(data || []))
      .catch(() => setAvailableCodes([]));
  }, []);

  const handleApply = async (codeToApply?: string) => {
    const targetCode = (codeToApply || code).trim().toUpperCase();
    if (!targetCode) {
      setErrorMsg('Please enter a gift card or redeem code');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const applied = await applyGiftCard(targetCode);
      setCode('');
      setSuccessMsg(`Redeemed ${applied.code}! Saved ${formatRupee(applied.discount)}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Invalid or expired gift card code';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    removeGiftCard();
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  // If a gift card is already applied, show the applied card voucher
  if (appliedGiftCard) {
    const isUnderMin = cart && cart.itemsTotal < appliedGiftCard.minOrderValue;

    return (
      <div
        className={cn(
          'rounded-[10px] border border-gold/40 bg-[linear-gradient(135deg,rgba(184,148,63,0.08)_0%,rgba(247,243,238,0.6)_100%)] p-3.5 transition-all',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dk">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-ink uppercase">
                  {appliedGiftCard.code}
                </span>
                <span className="rounded bg-forest/10 px-1.5 py-0.5 font-util text-[0.6rem] font-semibold text-forest uppercase">
                  Applied
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-2">
                {appliedGiftCard.description}
              </p>
              {isUnderMin && (
                <p className="mt-1 text-[0.72rem] text-copper">
                  Cart must be at least {formatRupee(appliedGiftCard.minOrderValue)} to apply this discount.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="font-body text-sm font-semibold tabular-nums text-forest">
              -{formatRupee(appliedGiftCard.discount)}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="font-util text-[0.62rem] uppercase tracking-wider text-ink-3 hover:text-copper underline transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-[10px] border border-line bg-surface/80 p-3.5', className)}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-left font-display-alt text-sm font-medium text-ink hover:text-gold transition-colors"
        >
          <svg
            className="h-4 w-4 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <span>Have a Gift Card or Redeem Code?</span>
        </button>

        {compact && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="font-util text-[0.65rem] text-ink-3 uppercase hover:text-gold"
          >
            {isExpanded ? 'Hide' : 'Redeem'}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. DEV100, GIFT500"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setErrorMsg(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleApply();
                }
              }}
              className="flex-1 rounded-[8px] border border-line bg-surface px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink outline-none transition-colors placeholder:font-body placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-3 focus:border-gold"
            />
            <button
              type="button"
              onClick={() => void handleApply()}
              disabled={loading || !code.trim()}
              className="rounded-[8px] bg-deep px-4 py-2 font-util text-[0.68rem] uppercase tracking-wider text-white transition-opacity hover:bg-ink disabled:opacity-50 flex items-center justify-center min-w-[72px]"
            >
              {loading ? <Spinner className="h-3.5 w-3.5 text-white" /> : 'Apply'}
            </button>
          </div>

          {errorMsg && (
            <p className="text-[0.72rem] text-red-600 transition-opacity">
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-[0.72rem] text-forest font-medium transition-opacity">
              {successMsg}
            </p>
          )}

          {availableCodes.length > 0 && (
            <div className="pt-1 border-t border-line/60">
              <span className="font-util text-[0.58rem] uppercase tracking-wider text-ink-3 block mb-1.5">
                Available codes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableCodes.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCode(c.code);
                      void handleApply(c.code);
                    }}
                    title={c.description}
                    className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-surface px-2.5 py-1 text-[0.68rem] text-ink hover:border-gold hover:bg-gold/10 transition-colors"
                  >
                    <span className="font-mono font-semibold text-gold-dk">{c.code}</span>
                    <span className="text-[0.62rem] text-ink-3">
                      ({c.discountType === 'flat' ? `₹${c.discountValue} off` : `${c.discountValue}% off`})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
