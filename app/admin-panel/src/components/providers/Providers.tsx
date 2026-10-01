'use client';

import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSocket } from '@/hooks/useSocket';

/** Bootstraps auth session + notifications and keeps the socket alive. */
function Bootstrap({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const status = useAuthStore((s) => s.status);
  const refreshNotifications = useNotificationStore((s) => s.refresh);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    if (status === 'authenticated') void refreshNotifications();
  }, [status, refreshNotifications]);

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
