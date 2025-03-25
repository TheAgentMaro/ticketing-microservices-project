import express from 'express';
import { purchaseTicket, getUserTickets } from '../controllers/ticketController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées par JWT
router.post('/purchase', authenticateToken, purchaseTicket); // Acheter un billet
router.get('/my-tickets', authenticateToken, getUserTickets); // Récupérer les billets de l'utilisateur

export default router;