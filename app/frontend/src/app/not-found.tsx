import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="util-label text-gold-dk">404 · Page Not Found</span>
      <h1 className="mt-3 font-display-alt text-4xl sm:text-5xl font-medium text-ink">Fragrance Not Found</h1>
      <p className="mt-3 max-w-md text-sm text-body leading-relaxed">
        The page or product you are looking for doesn&apos;t exist, was renamed, or has moved to another section of our boutique.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
        <Link href="/products" className="btn-secondary">
          Explore Collection
        </Link>
        <Link href="/account/profile" className="btn-secondary">
          My Account
        </Link>
      </div>
    </div>
  );
}
