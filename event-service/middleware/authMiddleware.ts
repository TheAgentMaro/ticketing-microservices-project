import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'microservices';

export interface AuthRequest extends Request {
  user?: { id: number; username: string; role: string };
}

// Définir une interface pour le payload JWT
interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

/**
 * Middleware pour vérifier le token JWT
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn('Tentative d’accès sans token');
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err: Error | null, decoded: unknown) => {
    if (err) {
      logger.warn(`Token invalide ou expiré : ${err.message}`);
      return res.status(403).json({ error: 'Token invalide' });
    }

    req.user = decoded as JwtPayload;
    next();
  });
};

/**
 * Middleware pour limiter l'accès aux event_creators ou admins
 */
export const restrictToEventCreatorOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const allowedRoles = ['event_creator', 'admin'];
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    logger.warn(`Accès non autorisé pour l'utilisateur ${req.user?.username} avec rôle ${req.user?.role}`);
    return res.status(403).json({ error: 'Accès réservé aux créateurs d’événements ou admins' });
  }
  next();
};