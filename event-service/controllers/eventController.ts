import { Request, Response } from 'express';
import { createEventService, getAllEventsService, getEventByIdService, updateEventService, deleteEventService } from '../services/eventService';
import logger from '../utils/logger';

/**
 * Créer un nouvel événement (event_creator ou admin uniquement)
 */
export const createEvent = async (req: Request, res: Response) => {
  const { name, date, max_tickets } = req.body;
  try {
    const event = await createEventService({ name, date, max_tickets });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message || 'Erreur serveur lors de la création' });
  }
};

/**
 * Lister tous les événements (accessible à tous)
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await getAllEventsService();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
};

/**
 * Récupérer un événement par ID (accessible à tous)
 */
export const getEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const event = await getEventByIdService(parseInt(id));
    if (!event) {
      logger.warn(`Événement non trouvé pour l'ID : ${id}`);
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Mettre à jour un événement (event_creator ou admin uniquement)
 */
export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, date, max_tickets } = req.body;
  try {
    const event = await updateEventService(parseInt(id), { name, date, max_tickets });
    if (!event) return res.status(404).json({ error: 'Événement non trouvé' });
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message || 'Erreur serveur' });
  }
};

/**
 * Supprimer un événement (event_creator ou admin uniquement)
 */
export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const rowCount = await deleteEventService(parseInt(id));
    if (rowCount === 0) return res.status(404).json({ error: 'Événement non trouvé' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};