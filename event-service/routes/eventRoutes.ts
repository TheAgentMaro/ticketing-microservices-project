import express from 'express';
import { createEvent, getEvents, getEvent, updateEvent, deleteEvent } from '../controllers/eventController';

const router = express.Router();

// Routes publiques
router.get('/', getEvents);           // Lister tous les événements
router.get('/:id', getEvent);         // Récupérer un événement par ID

// Routes protégées (à protéger plus tard)
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;