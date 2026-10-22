import Link from 'next/link';
import Image from 'next/image';

/**
 * Centered luxury brand shell used by register, forgot-password, and complete-profile.
 * Enhanced with richer card, ambient orbs, decorative flourish, and consistent Dev Creation palette.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  backLabel = 'Return to Shop',
  backHref = '/products',
  badge,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  backLabel?: string;
  backHref?: string;
  badge?: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[#FAF7F2] px-4 py-8 sm:px-6 sm:py-12 text-ink selection:bg-gold/20 selection:text-gold-dk overflow-y-auto">

      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-copper/8 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-56 w-96 -translate-x-1/2 rounded-full bg-amber-50/60 blur-2xl" />

      {/* Decorative dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: 'radial-gradient(circle, #2C1810 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Top navigation */}
      <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-7">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-4 py-2 font-util text-[0.65rem] font-semibold uppercase tracking-wider text-ink-2 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-gold hover:text-gold-dk"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {backLabel}
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 mx-auto w-full max-w-md my-auto pt-10 sm:pt-4">
        <div className="overflow-hidden rounded-3xl border border-gold/25 bg-white/97 shadow-[0_24px_60px_-16px_rgba(44,24,16,0.12)] backdrop-blur-md">

          {/* Gold accent top strip */}
          <div className="h-1 w-full bg-gradient-to-r from-gold via-copper to-gold-lt" />

          <div className="px-7 pb-8 pt-7 sm:px-9 sm:pb-10">
            {/* Logo + heading */}
            <div className="mb-6 text-center">
              <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105">
                <Image
                  src="/assets/Logos/Logo2.png"
                  alt="Dev Creation"
                  width={80}
                  height={80}
                  unoptimized
                  priority
                  className="mx-auto h-16 w-16 rounded-full object-contain shadow-[0_4px_16px_rgba(44,24,16,0.12)]"
                />
              </Link>

              {badge && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/8 px-3.5 py-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                  <span className="font-util text-[0.58rem] font-bold uppercase tracking-[0.2em] text-gold-dk">{badge}</span>
                </div>
              )}

              <h1 className="mt-3 font-display-alt text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
              <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-body">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>

        {/* Trust strip below card */}
        <div className="mt-5 flex items-center justify-center gap-4 font-util text-[0.62rem] uppercase tracking-wider text-ink-3">
          <span className="flex items-center gap-1"><span>🌿</span> Pure Soy Wax</span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1"><span>🔒</span> 256-bit Secure</span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1"><span>🇮🇳</span> Made in India</span>
        </div>
      </div>
    </div>
  );
}
