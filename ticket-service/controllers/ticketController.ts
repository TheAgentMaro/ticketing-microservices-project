import { Request, Response } from 'express';
import { createTicket, getTicketsByUser, getAvailableTickets } from '../models/ticketModel';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/authMiddleware';
import pool from '../config/db';

interface Ticket {
  id?: number;
  event_id: number;
  user_id: number;
  ticket_number: string;
  purchase_date: string;
}

export const purchaseTicket = async (userId: number, eventId: number): Promise<Ticket> => {
  try {
    // Vérifier le nombre de billets disponibles
    const availableTickets = await getAvailableTickets(eventId);
    if (availableTickets === -1) {
      throw new Error('Événement non trouvé');
    }
    if (availableTickets <= 0) {
      throw new Error('Aucune place disponible pour cet événement');
    }

    // Générer un numéro de billet unique (exemple simple)
    const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Créer le billet
    const ticket: Ticket = {
      event_id: eventId,
      user_id: userId,
      ticket_number: ticketNumber,
      purchase_date: new Date().toISOString(),
    };

    const newTicket = await createTicket(ticket);
    return newTicket;
  } catch (error) {
    logger.error(`Erreur lors de l'achat du billet: ${error}`);
    throw error;
  }
};

export const getUserTickets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const tickets = await getTicketsByUser(userId);
    res.status(200).json(tickets);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des billets de l'utilisateur: ${error}`);
    res.status(500).json({ error: "Erreur lors de la récupération des billets de l'utilisateur" });
  }
};

export const getAllTickets = async (req: AuthRequest, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets');
    res.status(200).json(rows as Ticket[]);
  } catch (error) {
    logger.error(`Erreur lors de la récupération de tous les billets: ${error}`);
    res.status(500).json({ error: 'Erreur lors de la récupération de tous les billets' });
  }
};