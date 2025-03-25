import { Ticket, getAvailableTickets, createTicket, getTicketsByUser } from '../models/ticketModel';
import { sendToQueue } from '../config/rabbitmq';
import logger from '../utils/logger';

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

    const ticketNumber = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const purchaseDate = new Date().toISOString();
    const ticket = await createTicket({ event_id: eventId, user_id: userId, ticket_number: ticketNumber, purchase_date: purchaseDate });

    // Envoyer une confirmation asynchrone via RabbitMQ
    const confirmationMessage = JSON.stringify({ ticketId: ticket.id, userId, eventId, type: 'email' });
    await sendToQueue(confirmationMessage);

    logger.info(`Billet acheté avec succès : ${ticket.id} pour l'utilisateur ${userId}`);
    return ticket;
  } catch (error) {
    logger.error(`Erreur lors de l'achat du billet : ${error}`);
    throw error;
  }
};

/**
 * Récupérer les billets d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des billets
 */
export const getUserTicketsService = async (userId: number): Promise<Ticket[]> => {
  try {
    const tickets = await getTicketsByUser(userId);
    logger.info(`Billets récupérés pour l'utilisateur ${userId}`);
    return tickets;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des billets pour l'utilisateur ${userId} : ${error}`);
    throw error;
  }
};