import express from 'express';
import { createEvent, getEvents, getEvent, updateEvent, deleteEvent } from '../controllers/eventController';

const router = express.Router();

// Routes CRUD pour les événements
router.post('/', createEvent);        // Créer un événement
router.get('/', getEvents);           // Lister tous les événements
router.get('/:id', getEvent);         // Récupérer un événement par ID
router.put('/:id', updateEvent);      // Mettre à jour un événement
router.delete('/:id', deleteEvent);   // Supprimer un événement

export default router;