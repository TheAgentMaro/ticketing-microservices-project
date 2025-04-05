import express from 'express';
import { purchaseTicket, getUserTickets, getAllTickets } from '../controllers/ticketController';
import { authenticateToken, restrictToOperatorOrAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées par JWT
router.post('/purchase', authenticateToken, purchaseTicket); // Acheter un billet
router.get('/my-tickets', authenticateToken, getUserTickets); // Récupérer les billets de l'utilisateur
router.get('/all', authenticateToken, restrictToOperatorOrAdmin, getAllTickets); // Récupérer tous les billets (operator/admin)

export default router;