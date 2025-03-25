import express from 'express';
import { createEvent, getEvents, getEvent, updateEvent, deleteEvent } from '../controllers/eventController';
import { authenticateToken, restrictToEventCreatorOrAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes publiques
router.get('/', getEvents);           // Lister tous les événements
router.get('/:id', getEvent);         // Récupérer un événement par ID

// Routes protégées par JWT
router.post('/', authenticateToken, restrictToEventCreatorOrAdmin, createEvent); // Créer un événement
router.put('/:id', authenticateToken, restrictToEventCreatorOrAdmin, updateEvent); // Mettre à jour un événement
router.delete('/:id', authenticateToken, restrictToEventCreatorOrAdmin, deleteEvent); // Supprimer un événement

export default router;