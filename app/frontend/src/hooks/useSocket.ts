'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { tokenStore } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { AppNotification } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? 'https://lightseagreen-donkey-692988.hostingersite.com';

interface SocketEventPayload {
  type: AppNotification['type'];
  title: string;
  message: string;
  relatedEntity?: { kind: string; id: string; ref?: string };
  createdAt: string;
}

/**
 * Establishes the authenticated Socket.IO connection once a user is logged in
 * and routes incoming real-time events into the notification store. Optional
 * callbacks let a page react to order updates or dashboard-refresh nudges.
 */
export function useSocket(handlers?: {
  onOrderUpdated?: (payload: SocketEventPayload) => void;
  onDashboardUpdate?: () => void;
  onAdminNotification?: (payload: SocketEventPayload) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const prepend = useNotificationStore((s) => s.prepend);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const token = tokenStore.get();
    if (status !== 'authenticated' || !user || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 3,
      timeout: 10000,
    });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      if (err.message === 'Unauthorized' || err.message.includes('unauthorized')) {
        socket.disconnect();
      }
    });

    const toNotification = (p: SocketEventPayload): AppNotification => ({
      _id: `rt-${p.createdAt}-${Math.random().toString(36).slice(2)}`,
      type: p.type,
      title: p.title,
      message: p.message,
      isRead: false,
      relatedEntity: p.relatedEntity,
      createdAt: p.createdAt,
    });

    socket.on('customer:notification', (p: SocketEventPayload) => prepend(toNotification(p)));
    socket.on('order:updated', (p: SocketEventPayload) => handlersRef.current?.onOrderUpdated?.(p));
    socket.on('admin:notification', (p: SocketEventPayload) => {
      prepend(toNotification(p));
      handlersRef.current?.onAdminNotification?.(p);
    });
    socket.on('admin:dashboard:update', () => handlersRef.current?.onDashboardUpdate?.());

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, status, prepend]);

  return socketRef;
}
