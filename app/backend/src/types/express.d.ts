import type { Role } from '@/constants';

/** Attaches the authenticated principal to the Express request object. */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
      };
    }
  }
}

export {};
