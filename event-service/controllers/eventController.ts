import { Request, Response } from 'express';
import { createEventService, getAllEventsService, getEventByIdService, updateEventService, deleteEventService } from '../services/eventService';
import logger from '../utils/logger';

/**
 * Créer un nouvel événement
 * @param req Requête avec les données de l'événement
 * @param res Réponse avec l'événement créé
 */
export const createEvent = async (req: Request, res: Response) => {
  const { name, date, max_tickets } = req.body;
  if (!name || !date || !max_tickets) {
    logger.warn('Tentative de création avec des champs manquants');
    return res.status(400).json({ error: 'Tous les champs (name, date, max_tickets) sont requis' });
  }
  try {
    const event = await createEventService({ name, date, max_tickets });
    res.status(201).json(event);
  } catch (error) {
    logger.error(`Erreur lors de la création de l'événement : ${error}`);
    res.status(500).json({ error: 'Erreur serveur lors de la création' });
  }
};

/**
 * Lister tous les événements
 * @param req Requête vide
 * @param res Réponse avec la liste des événements
 */
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await getAllEventsService();
    res.json(events);
  } catch (error) {
    logger.error(`Erreur lors de la récupération des événements : ${error}`);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération' });
  }
};

/**
 * Récupérer un événement par ID
 * @param req Requête avec l'ID
 * @param res Réponse avec l'événement
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
    logger.error(`Erreur lors de la récupération de l'événement ${id} : ${error}`);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Mettre à jour un événement
 * @param req Requête avec l'ID et les nouvelles données
 * @param res Réponse avec l'événement mis à jour
 */
export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, date, max_tickets } = req.body;
  if (!name || !date || !max_tickets) {
    logger.warn(`Tentative de mise à jour de l'événement ${id} avec des champs manquants`);
    return res.status(400).json({ error: 'Tous les champs (name, date, max_tickets) sont requis' });
  }
  try {
    const event = await updateEventService(parseInt(id), { name, date, max_tickets });
    if (!event) return res.status(404).json({ error: 'Événement non trouvé' });
    res.json(event);
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'événement ${id} : ${error}`);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Supprimer un événement
 * @param req Requête avec l'ID
 * @param res Réponse confirmant la suppression
 */
export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const rowCount = await deleteEventService(parseInt(id));
    if (rowCount === 0) {
      logger.warn(`Événement non trouvé pour suppression : ${id}`);
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    res.status(204).send();
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'événement ${id} : ${error}`);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};