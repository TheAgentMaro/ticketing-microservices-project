import { Request, Response } from 'express';
import { buyTicket, getUserTicketsService, getAllTicketsService } from '../services/ticketService';
import { AuthRequest } from '../middleware/authMiddleware';
import logger from '../utils/logger';

/**
 * Acheter un billet
 */
export const purchaseTicket = async (req: AuthRequest, res: Response) => {
  const { eventId } = req.body;
  const userId = req.user?.id;

  if (!eventId || !userId) {
    logger.warn('Tentative d’achat avec des champs manquants');
    return res.status(400).json({ error: 'eventId et authentification requis' });
  }

  try {
    const ticket = await buyTicket(eventId, userId);
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message || 'Erreur lors de l’achat' });
  }
};

/**
 * Récupérer les billets d’un utilisateur
 */
export const getUserTickets = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    logger.warn('Tentative de récupération des billets sans utilisateur authentifié');
    return res.status(401).json({ error: 'Authentification requise' });
  }

  try {
    const tickets = await getUserTicketsService(userId);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
};

/**
 * Récupérer tous les billets (pour operator ou admin)
 */
export const getAllTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await getAllTicketsService();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de tous les billets' });
  }
};