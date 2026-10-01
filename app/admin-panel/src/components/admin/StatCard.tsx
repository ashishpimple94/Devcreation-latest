import { cn } from '@/lib/utils';

type Accent = 'gold' | 'green' | 'amber' | 'red' | 'blue' | 'slate';

const ACCENT: Record<Accent, { bar: string; icon: string; ring: string }> = {
  gold: { bar: 'bg-gold', icon: 'text-gold-dk bg-[rgba(184,148,63,.1)]', ring: 'ring-gold/20' },
  green: { bar: 'bg-emerald-500', icon: 'text-emerald-700 bg-emerald-50', ring: 'ring-emerald-200' },
  amber: { bar: 'bg-amber-500', icon: 'text-amber-700 bg-amber-50', ring: 'ring-amber-200' },
  red: { bar: 'bg-red-500', icon: 'text-red-700 bg-red-50', ring: 'ring-red-200' },
  blue: { bar: 'bg-blue-500', icon: 'text-blue-700 bg-blue-50', ring: 'ring-blue-200' },
  slate: { bar: 'bg-ink-3', icon: 'text-ink-2 bg-surface-2', ring: 'ring-line' },
};

/**
 * Enterprise KPI card: accent bar, icon chip, big value, and an optional trend
 * delta (up/down vs. a comparison period).
 */
export function StatCard({
  label,
  value,
  hint,
  accent = 'slate',
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: Accent;
  icon?: React.ReactNode;
  trend?: { value: number; label?: string };
}) {
  const a = ACCENT[accent];
  const up = (trend?.value ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card">
      <span className={cn('absolute inset-x-0 top-0 h-1', a.bar)} />
      <div className="flex items-start justify-between">
        <div className="font-util text-[0.58rem] uppercase tracking-[0.16em] text-ink-3">{label}</div>
        {icon && (
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl ring-1', a.icon, a.ring)}>
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-[1.9rem] font-medium leading-none text-ink">{value}</div>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-util text-[0.55rem] font-semibold',
              up ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
            )}
          >
            {up ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
        )}
        {(trend?.label || hint) && <span className="text-[0.7rem] text-ink-3">{trend?.label ?? hint}</span>}
      </div>
    </div>
  );
}
