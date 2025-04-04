import express from 'express';
import { purchaseTicket, getUserTickets, getAllTickets } from '../controllers/ticketController';
import { AuthRequest, authenticateToken, restrictToOperatorOrAdmin } from '../middleware/authMiddleware'; // Import AuthRequest
import { sendTicketConfirmation, sendTicketPurchase } from '../utils/rabbitmq';
import logger from '../utils/logger';

const router = express.Router();

// Route pour acheter un billet (protégée par JWT)
router.post('/purchase', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user!.id; // Maintenant TypeScript sait que req.user existe

    if (!eventId) {
      return res.status(400).json({ error: 'Le champ eventId est requis' });
    }

    if (!Number.isInteger(eventId)) {
      return res.status(400).json({ error: 'eventId doit être un entier' });
    }

    const ticket = await purchaseTicket(userId, eventId);

    const ticketData = {
      ticketId: ticket.id,
      userId: ticket.user_id,
      eventId: ticket.event_id,
      ticketNumber: ticket.ticket_number,
      type: 'email',
    };

    // Envoyer un message de confirmation à la file ticket_confirmation
    await sendTicketConfirmation(JSON.stringify(ticketData));

    // Envoyer un message d'achat à event-service via la file ticket_purchases
    await sendTicketPurchase({
      ticketId: ticket.id!,
      userId: ticket.user_id,
      eventId: ticket.event_id,
      ticketNumber: ticket.ticket_number,
    });

    res.status(201).json({ message: 'Billet acheté avec succès', ticket });
  } catch (error) {
    logger.error(`Erreur lors de l'achat du billet: ${error}`);
    res.status(500).json({ error: "Erreur lors de l'achat du billet" });
  }
});

// Route pour récupérer les billets de l'utilisateur (protégée par JWT)
router.get('/my-tickets', authenticateToken, getUserTickets);

// Route pour récupérer tous les billets (réservée aux opérateurs/admins, protégée par JWT)
router.get('/all', authenticateToken, restrictToOperatorOrAdmin, getAllTickets);

export default router;