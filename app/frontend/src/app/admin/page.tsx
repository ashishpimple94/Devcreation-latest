'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminRedirect() {
  const [adminUrl, setAdminUrl] = useState('https://login.devcreation24.in');
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        setAdminUrl('http://localhost:3002');
        setIsLocal(true);
      } else if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
        setAdminUrl(`http://${host}:3002`);
        setIsLocal(true);
      } else {
        const configured = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://login.devcreation24.in';
        setAdminUrl(configured);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f5f0] p-6 text-center text-ink antialiased">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-card text-center">
        <div className="h-10 w-10 mx-auto animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <h1 className="mt-4 font-display-alt text-2xl font-medium text-ink">Admin Management Panel</h1>
        <p className="mt-2 font-body text-sm text-ink-3">
          Authorized staff access for Dev Creation order management, catalog, and store controls.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={adminUrl}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-deep px-5 py-3 font-util text-xs font-semibold uppercase tracking-wider text-white hover:bg-gold-dk transition-colors"
          >
            Launch Admin Panel &rarr;
          </a>

          {isLocal && (
            <a
              href="https://login.devcreation24.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-2.5 font-util text-xs font-semibold uppercase tracking-wider text-ink hover:bg-surface-2 transition-colors"
            >
              Open Cloud Production Panel
            </a>
          )}

          <Link
            href="/"
            className="mt-2 font-util text-xs uppercase tracking-wider text-ink-3 hover:text-ink underline"
          >
            Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
