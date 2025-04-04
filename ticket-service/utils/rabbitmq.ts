import { connectRabbitMQ, sendToQueue, closeRabbitMQ } from '@ticketing/rabbitmq';
import logger from './logger';

// Fonction pour gérer les messages de confirmation
const handleTicketConfirmation = async (msg: any) => {
  const content = msg.toString();
  logger.info(`Confirmation envoyée (simulation) : ${content}`);
};

// Fonction pour gérer les mises à jour d'événements
const handleEventUpdate = async (msg: any) => {
  const eventUpdate = JSON.parse(msg.toString());
  logger.info(`Mise à jour d'événement reçue dans ticket-service : ${JSON.stringify(eventUpdate)}`);
  // Exemple : Mettre à jour les billets associés à cet événement
};

// Initialiser la connexion et le consommateur pour ticket-service
export const initRabbitMQ = async () => {
  await connectRabbitMQ({
    queue: 'ticket_confirmation',
    handler: handleTicketConfirmation,
    queueOptions: { durable: true },
    qos: { prefetchCount: 1 },
  });

  await connectRabbitMQ({
    queue: 'event_updates',
    handler: handleEventUpdate,
    queueOptions: { durable: true },
    qos: { prefetchCount: 1 },
  });
};

// Envoyer un message à la file ticket_confirmation
export const sendTicketConfirmation = async (message: string) => {
  await sendToQueue('ticket_confirmation', message);
};

// Envoyer un achat de billet à event-service
export const sendTicketPurchase = async (purchase: { eventId: number; userId: number; ticketId: number; ticketNumber: string }) => {
  await sendToQueue('ticket_purchases', JSON.stringify(purchase));
};

// Exporter closeRabbitMQ
export { closeRabbitMQ };