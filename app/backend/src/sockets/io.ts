import type { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '@/config/env';
import { verifyAccessToken } from '@/utils/jwt';
import { STAFF_ROLES, SOCKET_ROOMS } from '@/constants';
import { logger } from '@/utils/logger';

let io: SocketIOServer | null = null;

/**
 * Initialises Socket.IO on top of the HTTP server. Connections are authenticated
 * with the same JWT as the REST API; authenticated sockets join a per-user room
 * and, for staff, the shared admin room.
 */
export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as { token?: string })?.token ??
      (socket.handshake.headers.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.slice(7)
        : undefined);
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.data as { userId: string; role: string };
    socket.join(SOCKET_ROOMS.user(userId));
    if (STAFF_ROLES.includes(role as never)) socket.join(SOCKET_ROOMS.admins);
    logger.debug('Socket connected', { userId, role });

    socket.on('disconnect', () => logger.debug('Socket disconnected', { userId }));
  });

  logger.info('Socket.IO initialised');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
}
