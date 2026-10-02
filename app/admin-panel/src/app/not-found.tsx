import Link from 'next/link';
import Image from 'next/image';

export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f5f0] px-6 text-center text-ink antialiased">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-card">
        <Image
          src="/assets/Logos/logo.jpeg"
          alt="Dev Creation"
          width={120}
          height={60}
          className="mx-auto h-14 w-auto object-contain"
        />
        <span className="mt-4 inline-block font-util text-[0.6rem] font-bold uppercase tracking-[0.2em] text-copper">
          404 · Page Not Found
        </span>
        <h1 className="mt-2 font-display-alt text-2xl font-medium text-ink">Administrative View Not Found</h1>
        <p className="mt-2 font-body text-xs text-ink-3 leading-relaxed">
          The requested administrative resource, product editor, or order panel does not exist or has been relocated.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="w-full rounded-xl bg-deep py-2.5 font-util text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-gold-dk"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/products"
            className="w-full rounded-xl border border-line py-2.5 font-util text-xs font-semibold uppercase tracking-wider text-ink-2 hover:bg-surface-2"
          >
            Manage Products
          </Link>
        </div>
      </div>
    </div>
  );
}
