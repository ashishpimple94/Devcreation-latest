import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="util-label">404</span>
      <h1 className="mt-3 font-display-alt text-5xl font-medium text-ink">Page not found</h1>
      <p className="mt-3 max-w-sm text-body">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
