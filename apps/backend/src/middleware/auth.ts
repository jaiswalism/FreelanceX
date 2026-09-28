import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../database/prisma.js';
import { JwtPayload } from '../modules/auth/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    address: string;
    sessionId: string;
  };
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token as string, config.jwtSecret) as JwtPayload;

    // Verify session in DB has not been revoked
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
    });

    if (!session || session.revoked || new Date() > session.expiresAt) {
      res.status(401).json({ error: 'Session expired or revoked. Please re-authenticate.' });
      return;
    }

    req.user = {
      id: decoded.userId,
      address: decoded.address,
      sessionId: decoded.sessionId,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
