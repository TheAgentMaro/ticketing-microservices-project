import { connectRabbitMQ, sendToQueue, closeRabbitMQ } from '@ticketing/rabbitmq';
import logger from './logger';

// Fonction pour gérer les mises à jour d'événements (consommée par d'autres services)
const handleEventUpdate = async (msg: any) => {
  const eventUpdate = JSON.parse(msg.toString());
  logger.info(`Mise à jour d'événement reçue : ${JSON.stringify(eventUpdate)}`);
  // Exemple : Logique pour traiter la mise à jour (peut être consommée par ticket-service)
};

// Fonction pour gérer les achats de billets (envoyés par ticket-service)
const handleTicketPurchase = async (msg: any) => {
  const purchase = JSON.parse(msg.toString());
  logger.info(`Achat de billet reçu dans event-service : ${JSON.stringify(purchase)}`);
  // Exemple : Mettre à jour la disponibilité des places pour l'événement
};

// Fonction pour gérer les événements d'authentification (envoyés par auth-service)
const handleAuthEvent = async (msg: any) => {
  const event = JSON.parse(msg.toString());
  logger.info(`Événement d'authentification reçu dans event-service : ${JSON.stringify(event)}`);
  // Exemple : Vérifier si l'utilisateur est un organisateur et lui permettre de créer un événement
};

// Fonction pour gérer les mises à jour d'utilisateur (envoyées par user-service)
const handleUserUpdate = async (msg: any) => {
  const update = JSON.parse(msg.toString());
  logger.info(`Mise à jour d'utilisateur reçue dans event-service : ${JSON.stringify(update)}`);
  // Exemple : Mettre à jour les informations de l'organisateur d'événement
};

// Initialiser la connexion et les consommateurs pour event-service
export const initRabbitMQ = async () => {
  // Consommer les messages de la file event_updates (peut être utilisé par d'autres services)
  await connectRabbitMQ({
    queue: 'event_updates',
    handler: handleEventUpdate,
    queueOptions: { durable: true },
    qos: { prefetchCount: 1 },
  });

  // Consommer les messages de la file ticket_purchases (envoyés par ticket-service)
  await connectRabbitMQ({
    queue: 'ticket_purchases',
    handler: handleTicketPurchase,
    queueOptions: { durable: true },
    qos: { prefetchCount: 1 },
  });

  // Consommer les événements d'authentification (envoyés par auth-service)
  await connectRabbitMQ({
    queue: 'auth_events',
    handler: handleAuthEvent,
    queueOptions: { durable: true },
    qos: { prefetchCount: 1 },
  });

  // Consommer les mises à jour d'utilisateur (envoyées par user-service)
  await connectRabbitMQ({
    queue: 'user_updated',
    handler: handleUserUpdate,
    queueOptions: { durable: true },
    qos: { prefetchCount: 1 },
  });
};

// Fonction pour envoyer une mise à jour d'événement
export const sendEventUpdate = async (update: { eventId: number; action: string; details: any }) => {
  await sendToQueue('event_updates', JSON.stringify(update));
};

// Fonction pour envoyer un achat de billet (peut être utilisé pour tester)
export const sendTicketPurchase = async (purchase: { eventId: number; userId: number; ticketId: number }) => {
  await sendToQueue('ticket_purchases', JSON.stringify(purchase));
};

// Exporter closeRabbitMQ pour une utilisation ailleurs
export { closeRabbitMQ };