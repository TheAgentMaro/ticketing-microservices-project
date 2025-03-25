import express from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController';

const router = express.Router();

// Routes CRUD pour les événements
router.post('/', createEvent);      // Créer un événement
router.get('/', getEvents);         // Lister tous les événements
router.put('/:id', updateEvent);    // Mettre à jour un événement
router.delete('/:id', deleteEvent); // Supprimer un événement

export default router;