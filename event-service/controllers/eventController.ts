import { Request, Response } from 'express';

// Simuler une base de données en mémoire (remplacer par PostgreSQL plus tard)
const events: any[] = [];

/**
 * Créer un nouvel événement
 * @param req Requête contenant les détails de l'événement
 * @param res Réponse avec l'événement créé ou une erreur
 */
export const createEvent = (req: Request, res: Response) => {
  const { name, date, maxTickets } = req.body;
  if (!name || !date || !maxTickets) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  const event = { id: events.length + 1, name, date, maxTickets };
  events.push(event);
  res.status(201).json(event);
};

/**
 * Lister tous les événements
 * @param req Requête vide
 * @param res Réponse avec la liste des événements
 */
export const getEvents = (req: Request, res: Response) => {
  res.json(events);
};

/**
 * Mettre à jour un événement existant
 * @param req Requête avec l'ID et les nouvelles données
 * @param res Réponse avec l'événement mis à jour ou une erreur
 */
export const updateEvent = (req: Request, res: Response) => {
  const { id } = req.params;
  const event = events.find(e => e.id === parseInt(id));
  if (!event) return res.status(404).json({ error: 'Événement non trouvé' });
  Object.assign(event, req.body);
  res.json(event);
};

/**
 * Supprimer un événement
 * @param req Requête avec l'ID de l'événement
 * @param res Réponse confirmant la suppression
 */
export const deleteEvent = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = events.findIndex(e => e.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: 'Événement non trouvé' });
  events.splice(index, 1);
  res.status(204).send();
};