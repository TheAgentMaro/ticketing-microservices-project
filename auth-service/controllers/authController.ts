import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService';
import logger from '../utils/logger';

/**
 * Inscription d'un nouvel utilisateur
 * @param req Requête avec les données de l'utilisateur
 * @param res Réponse avec l'utilisateur créé
 */
export const register = async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    logger.warn('Tentative d’inscription avec des champs manquants');
    return res.status(400).json({ error: 'Tous les champs (username, password, role) sont requis' });
  }
  if (!['admin', 'event_creator', 'operator', 'user'].includes(role)) {
    logger.warn(`Rôle invalide fourni : ${role}`);
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  try {
    const user = await registerUser({ username, password, role });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message || 'Erreur lors de l’inscription' });
  }
};

/**
 * Connexion d’un utilisateur
 * @param req Requête avec username et password
 * @param res Réponse avec le token JWT
 */
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    logger.warn('Tentative de connexion avec des champs manquants');
    return res.status(400).json({ error: 'Username et password sont requis' });
  }
  try {
    const token = await loginUser(username, password);
    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message || 'Erreur lors de la connexion' });
  }
};