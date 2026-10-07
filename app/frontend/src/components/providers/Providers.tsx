'use client';

import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSocket } from '@/hooks/useSocket';

/** Bootstraps global state (auth session, cart, notifications) and the socket. */
function Bootstrap({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const status = useAuthStore((s) => s.status);
  const refreshCart = useCartStore((s) => s.refresh);
  const refreshNotifications = useNotificationStore((s) => s.refresh);

  // Restore the session on first load & pre-warm backend to eliminate cold starts.
  useEffect(() => {
    void init();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://lightseagreen-donkey-692988.hostingersite.com/api';
    fetch(`${apiUrl}/health`, { method: 'GET' }).catch(() => {});
  }, [init]);

  // Once authenticated, hydrate cart + notifications.
  useEffect(() => {
    if (status === 'authenticated') {
      void refreshCart();
      void refreshNotifications();
    }
  }, [status, refreshCart, refreshNotifications]);

  // Keep the real-time connection alive app-wide.
  useSocket();

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Bootstrap>{children}</Bootstrap>
    </ToastProvider>
  );
}
