import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'microservice';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

// Define JWT error types manually
type JwtVerifyError = 
  | { name: 'JsonWebTokenError'; message: string }
  | { name: 'TokenExpiredError'; message: string; expiredAt: Date }
  | { name: 'NotBeforeError'; message: string; date: Date }
  | null;

/**
 * Middleware pour vérifier le token JWT
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn("Tentative d'accès sans token");
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err: JwtVerifyError, decoded: any) => {
    if (err) {
      logger.warn('Token invalide ou expiré');
      return res.status(403).json({ error: 'Token invalide' });
    }
    
    const user = decoded as JwtPayload;
    req.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };
    
    next();
  });
};

/**
 * Middleware pour limiter l'accès aux admins
 */
export const restrictToAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    logger.warn(`Accès non autorisé pour l'utilisateur ${req.user?.username} avec rôle ${req.user?.role}`);
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }
  next();
};