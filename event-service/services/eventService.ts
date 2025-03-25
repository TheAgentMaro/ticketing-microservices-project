import { Event, createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from '../models/eventModel';
import logger from '../utils/logger';

/**
 * Créer un événement
 * @param event Données de l'événement
 * @returns L'événement créé
 */
export const createEventService = async (event: Event): Promise<Event> => {
  try {
    const newEvent = await createEvent(event);
    logger.info(`Événement créé avec succès : ${newEvent.id}`);
    return newEvent;
  } catch (error) {
    logger.error(`Erreur lors de la création de l'événement : ${error}`);
    throw error;
  }
};

/**
 * Récupérer tous les événements
 * @returns Liste des événements
 */
export const getAllEventsService = async (): Promise<Event[]> => {
  try {
    const events = await getAllEvents();
    logger.info('Événements récupérés avec succès');
    return events;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des événements : ${error}`);
    throw error;
  }
};

/**
 * Récupérer un événement par ID
 * @param id ID de l'événement
 * @returns L'événement ou null
 */
export const getEventByIdService = async (id: number): Promise<Event | null> => {
  try {
    const event = await getEventById(id);
    if (!event) logger.warn(`Aucun événement trouvé pour l'ID : ${id}`);
    return event;
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'événement ${id} : ${error}`);
    throw error;
  }
};

/**
 * Mettre à jour un événement
 * @param id ID de l'événement
 * @param event Nouvelles données
 * @returns L'événement mis à jour
 */
export const updateEventService = async (id: number, event: Event): Promise<Event | null> => {
  try {
    const updatedEvent = await updateEvent(id, event);
    if (updatedEvent) {
      logger.info(`Événement mis à jour : ${id}`);
    } else {
      logger.warn(`Événement non trouvé pour mise à jour : ${id}`);
    }
    return updatedEvent;
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'événement ${id} : ${error}`);
    throw error;
  }
};

/**
 * Supprimer un événement
 * @param id ID de l'événement
 * @returns Nombre de lignes supprimées
 */
export const deleteEventService = async (id: number): Promise<number> => {
  try {
    const rowCount = await deleteEvent(id);
    if (rowCount > 0) {
      logger.info(`Événement supprimé : ${id}`);
    } else {
      logger.warn(`Événement non trouvé pour suppression : ${id}`);
    }
    return rowCount;
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'événement ${id} : ${error}`);
    throw error;
  }
};