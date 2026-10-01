'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui';
import { AuthShell } from '@/components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const { success, error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{ delivered: boolean; devToken?: string }>(
        '/auth/forgot-password',
        { email },
        { auth: false },
      );
      setSent(true);
      // In development the backend returns a token so the flow is testable without email.
      if (res.data.devToken) setDevToken(res.data.devToken);
      success('If that email exists, a reset link has been sent');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-body">
            Check your inbox for a reset link. It expires in 15 minutes.
          </p>
          {devToken && (
            <p className="mt-4 break-all rounded-[10px] border border-line bg-surface-2 p-3 font-util text-[0.62rem] text-ink-2">
              Dev reset token: {devToken}
            </p>
          )}
          <Link href="/login" className="mt-6 inline-block font-medium text-gold hover:text-gold-dk">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <label className="mb-6 block">
            <span className="util-label">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-[10px] border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-gold"
            />
          </label>
          <Button type="submit" loading={loading} className="w-full">
            Send reset link
          </Button>
          <p className="mt-6 text-center text-sm text-body">
            <Link href="/login" className="font-medium text-gold hover:text-gold-dk">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
