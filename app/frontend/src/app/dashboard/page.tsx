'use client';

import { useEffect } from 'react';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001';

export default function DashboardRedirect() {
  useEffect(() => {
    window.location.href = `${ADMIN_URL}/dashboard`;
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f5f0] p-6 text-center text-ink antialiased">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      <h1 className="font-display-alt text-2xl font-medium">Opening Admin Dashboard...</h1>
      <p className="font-body text-sm text-ink-3">Redirecting to {ADMIN_URL}/dashboard</p>
      <a
        href={`${ADMIN_URL}/dashboard`}
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-deep px-5 py-2.5 font-util text-xs uppercase tracking-wider text-white hover:bg-gold-dk"
      >
        Go to Dashboard &rarr;
      </a>
    </div>
  );
}
