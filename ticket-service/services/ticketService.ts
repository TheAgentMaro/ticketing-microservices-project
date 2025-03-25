import { Ticket, getAvailableTickets, createTicket, getTicketsByUser, getAllTickets } from '../models/ticketModel';
import { sendToQueue } from '../config/rabbitmq';
import logger from '../utils/logger';

/**
 * Simuler un paiement par carte bancaire
 * @param userId ID de l'utilisateur
 * @param eventId ID de l'événement
 * @returns Résultat du paiement (succès ou échec)
 */
const simulatePayment = async (userId: number, eventId: number): Promise<boolean> => {
  try {
    logger.info(`Simulation de paiement CB pour utilisateur ${userId}, événement ${eventId}`);
    // Simule un paiement avec une chance d'échec (10%)
    const paymentSuccess = Math.random() > 0.1;
    if (!paymentSuccess) {
      logger.warn(`Échec simulé du paiement pour utilisateur ${userId}, événement ${eventId}`);
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Simule une latence de 500ms
    return true;
  } catch (error) {
    logger.error(`Erreur lors de la simulation du paiement : ${error}`);
    return false;
  }
};

/**
 * Acheter un billet
 * @param eventId ID de l'événement
 * @param userId ID de l'utilisateur
 * @returns Le billet créé
 */
export const buyTicket = async (eventId: number, userId: number): Promise<Ticket> => {
  try {
    const availableTickets = await getAvailableTickets(eventId);
    if (availableTickets === -1) {
      logger.warn(`Événement non trouvé : ${eventId}`);
      throw new Error('Événement non trouvé');
    }
    if (availableTickets <= 0) {
      logger.warn(`Plus de billets disponibles pour l'événement ${eventId}`);
      throw new Error('Plus de billets disponibles');
    }

    // Simulation de paiement CB
    const paymentSuccess = await simulatePayment(userId, eventId);
    if (!paymentSuccess) {
      const errorMessage = JSON.stringify({ userId, eventId, error: 'Échec du paiement' });
      await sendToQueue('ticket_errors', errorMessage);
      throw new Error('Échec du paiement');
    }

    const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const purchaseDate = new Date().toISOString();
    const ticket = await createTicket({ event_id: eventId, user_id: userId, ticket_number: ticketNumber, purchase_date: purchaseDate });

    // Envoyer une confirmation asynchrone via RabbitMQ
    const confirmationMessage = JSON.stringify({ ticketId: ticket.id, userId, eventId, type: 'email' });
    await sendToQueue('ticket_confirmation', confirmationMessage);

    logger.info(`Billet acheté avec succès : ${ticket.id} pour l'utilisateur ${userId}`);
    return ticket;
  } catch (error) {
    logger