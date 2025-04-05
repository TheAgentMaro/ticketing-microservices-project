import { Request, Response } from 'express';
import { getAllUsersService, getUserByIdService, updateUserService, deleteUserService, createUserService } from '../services/userService';
import { AuthRequest } from '../middleware/authMiddleware';
import logger from '../utils/logger';

/**
 * Créer un utilisateur (admin uniquement)
 */
export const createUser = async (req: AuthRequest, res: Response) => {
  const { username, role, password } = req.body;

  if (!username || !role || !password) {
    logger.warn('Tentative de création d’utilisateur avec des champs manquants');
    return res.status(400).json({ error: 'Username, role et password sont requis' });
  }
  if (!['admin', 'event_creator', 'operator', 'user'].includes(role)) {
    logger.warn(`Rôle invalide fourni : ${role}`);
    return res.status(400).json({ error: 'Rôle invalide' });
  }

  try {
    const user = await createUserService({ username, role, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message || 'Erreur serveur lors de la création' });
  }
};

/**
 * Récupérer tous les utilisateurs (admin uniquement)
 */
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
};

/**
 * Récupérer un utilisateur par ID
 */
export const getUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const user = await getUserByIdService(parseInt(id));
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Récupérer les données de l'utilisateur connecté
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn('Tentative de récupération des données sans utilisateur authentifié');
    return res.status(401).json({ error: 'Authentification requise' });
  }

  try {
    const user = await getUserByIdService(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
};

/**
 * Mettre à jour un utilisateur (admin uniquement)
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { username, role } = req.body;
  if (!username || !role) {
    logger.warn(`Tentative de mise à jour de l'utilisateur ${id} avec des champs manquants`);
    return res.status(400).json({ error: 'Username et role sont requis' });
  }
  if (!['admin', 'event_creator', 'operator', 'user'].includes(role)) {
    logger.warn(`Rôle invalide fourni : ${role}`);
    return res.status(400).json({ error: 'Rôle invalide' });
  }
  try {
    const user = await updateUserService(parseInt(id), { username, role });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Supprimer un utilisateur (admin uniquement)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const rowCount = await deleteUserService(parseInt(id));
    if (rowCount === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};