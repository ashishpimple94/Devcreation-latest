import Link from 'next/link';

/** Top announcement bar — dark deep bg with gold text, from the original design. */
export function AnnounceBar() {
  return (
    <div className="flex items-center justify-center gap-[18px] border-b border-white/[.06] bg-deep px-[var(--pad)] py-[11px] text-center font-util text-[0.62rem] uppercase tracking-[0.18em] text-gold-lt max-[860px]:tracking-[0.14em] max-[860px]:text-[0.52rem]">
      <span>
        Free shipping on all orders above ₹999.{' '}
        <Link href="/products" className="text-gold-lt underline underline-offset-[3px] hover:text-white">
          Shop now
        </Link>
      </span>
    </div>
  );
}
