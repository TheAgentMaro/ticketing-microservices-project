import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here_very_long_and_secure';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Tentative d’accès sans token');
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Token invalide ou expiré');
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user as AuthRequest['user'];
    next();
  });
};