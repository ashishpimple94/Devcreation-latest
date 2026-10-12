import Link from 'next/link';
import Image from 'next/image';

/** Centered luxury brand shell for auth screens (register, forgot-password, complete-profile). */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16 bg-[#FAF7F2] text-ink overflow-hidden selection:bg-gold/20 selection:text-gold-dk">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-amber-600/5 blur-3xl" />

      {/* Top back navigation */}
      <div className="absolute top-6 left-6 z-20 sm:top-8 sm:left-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-4 py-2 font-util text-[0.68rem] font-semibold uppercase tracking-wider text-ink-2 shadow-xs backdrop-blur-md transition-all hover:border-gold hover:text-gold-dk"
        >
          <span>&larr;</span>
          <span>Boutique</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="rounded-3xl border border-gold/30 bg-white/95 p-8 sm:p-10 shadow-[0_20px_50px_-15px_rgba(44,24,16,0.08)] backdrop-blur-md transition-all">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block transition-transform hover:scale-105 duration-200">
              <Image
                src="/assets/Logos/Logo2.png"
                alt="Dev Creation"
                width={80}
                height={80}
                className="h-16 w-16 object-contain rounded-full mx-auto shadow-sm"
                priority
              />
            </Link>
            <h1 className="mt-4 font-display-alt text-2xl sm:text-3xl font-medium text-ink">{title}</h1>
            <p className="mt-1.5 text-xs text-body leading-relaxed max-w-xs mx-auto">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
