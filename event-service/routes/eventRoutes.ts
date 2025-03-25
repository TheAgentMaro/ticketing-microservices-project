import express from 'express';
import { createEvent, getEvents, getEvent, updateEvent, deleteEvent } from '../controllers/eventController';
import { authenticateToken, restrictToEventCreatorOrAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', getEvents);           // Lister tous les événements
router.get('/:id', getEvent);         // Récupérer un événement par ID

// Routes protégées (event_creator ou admin uniquement)
router.post('/', authenticateToken, restrictToEventCreatorOrAdmin, createEvent);
router.put('/:id', authenticateToken, restrictToEventCreatorOrAdmin, updateEvent);
router.delete('/:id', authenticateToken, restrictToEventCreatorOrAdmin, deleteEvent);

export default router;