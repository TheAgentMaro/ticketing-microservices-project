import { z } from 'zod';
import { Event, createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } from '../models/eventModel';
import logger from '../utils/logger';
import pool from '../config/db'; 

// Schéma de validation pour un événement
const eventSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Date invalide' }),
  max_tickets: z.number().int().min(1, 'Le nombre maximum de billets doit être positif'),
});

/**
 * Créer un événement
 */
export const createEventService = async (event: Event): Promise<Event> => {
  try {
    const validatedEvent = eventSchema.parse(event);
    const newEvent = await createEvent(validatedEvent);
    logger.info(`Événement créé avec succès : ${newEvent.id}`);
    return newEvent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`Validation échouée : ${error.errors.map(e => e.message).join(', ')}`);
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    logger.error(`Erreur lors de la création de l'événement : ${error}`);
    throw error;
  }
};

/**
 * Récupérer tous les événements
 */
export const getAllEventsService = async (): Promise<Event[]> => {
  try {
    return await getAllEvents();
  } catch (error) {
    logger.error(`Erreur lors de la récupération des événements : ${error}`);
    throw error;
  }
};

/**
 * Récupérer un événement par ID
 */
export const getEventByIdService = async (id: number): Promise<Event | null> => {
  try {
    return await getEventById(id);
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'événement ${id} : ${error}`);
    throw error;
  }
};

/**
 * Mettre à jour un événement
 */
export const updateEventService = async (id: number, event: Event): Promise<Event | null> => {
  try {
    const validatedEvent = eventSchema.parse(event);
    const updatedEvent = await updateEvent(id, validatedEvent);
    if (updatedEvent) {
      logger.info(`Événement mis à jour : ${id}`);
    }
    return updatedEvent;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn(`Validation échouée : ${error.errors.map(e => e.message).join(', ')}`);
      throw new Error(error.errors.map(e => e.message).join(', '));
    }
    logger.error(`Erreur lors de la mise à jour de l'événement ${id} : ${error}`);
    throw error;
  }
};

/**
 * Supprimer un événement
 */
export const deleteEventService = async (id: number): Promise<number> => {
  try {
    const rowCount = await deleteEvent(id);
    if (rowCount > 0) {
      logger.info(`Événement supprimé : ${id}`);
    }
    return rowCount;
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'événement ${id} : ${error}`);
    throw error;
  }
};