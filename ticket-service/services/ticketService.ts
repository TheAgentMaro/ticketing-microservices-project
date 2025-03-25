import { Ticket, getAvailableTickets, createTicket, getTicketsByUser } from '../models/ticketModel';
import { sendToQueue } from '../config/rabbitmq';
import logger from '../utils/logger';
import pool from '../config/db'; // Ajout de cette importation

/**
 * Simuler un paiement par carte bancaire
 * @param userId ID de l'utilisateur
 * @param eventId ID de l'événement
 * @returns Succès ou échec du paiement
 */
const simulatePayment = async (userId: number, eventId: number): Promise<boolean> => {
  logger.info(`Simulation de paiement CB pour l'utilisateur ${userId}, événement ${eventId}`);
  // Simule une latence réseau et un taux d'échec de 5%
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.05;
      if (!success) logger.warn(`Échec simulé du paiement pour l'utilisateur ${userId}`);
      resolve(success);
    }, 500);
  });
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

    // Simuler le paiement CB
    const paymentSuccess = await simulatePayment(userId, eventId);
    if (!paymentSuccess) {
      const errorMessage = JSON.stringify({ userId, eventId, error: 'Échec du paiement', timestamp: new Date().toISOString() });
      await sendToQueue(errorMessage); // Notification asynchrone de l'échec
      throw new Error('Échec du paiement');
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

/**
 * Récupérer tous les billets (pour operator ou admin)
 * @returns Liste de tous les billets
 */
export const getAllTicketsService = async (): Promise<Ticket[]> => {
  try {
    const [rows] = await pool.query('SELECT * FROM tickets');
    logger.info('Tous les billets récupérés');
    return rows as Ticket[];
  } catch (error) {
    logger.error(`Erreur lors de la récupération de tous les billets : ${error}`);
    throw error;
  }
};