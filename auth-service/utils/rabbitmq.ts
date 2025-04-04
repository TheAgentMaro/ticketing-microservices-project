import { connectRabbitMQ, sendToQueue, closeRabbitMQ } from '@ticketing/rabbitmq';
import logger from './logger';

// Fonction pour gérer les mises à jour d'utilisateur (publiées par user-service)
const handleUserUpdate = async (msg: any) => {
  const update = JSON.parse(msg.toString());
  logger.info(`Mise à jour d'utilisateur reçue dans auth-service : ${JSON.stringify(update)}`);
  // Exemple : Si un utilisateur est supprimé, on pourrait invalider ses tokens
  if (update.action === 'deleted') {
    logger.info(`Utilisateur ${update.userId} supprimé, invalidation des tokens (simulation)`);
    // Logique pour invalider les tokens (par exemple, ajouter l'utilisateur à une liste noire)
  }
};

// Initialiser la connexion et les consommateurs pour auth-service
export const initRabbitMQ = async () => {
  try {
    // Consommer les mises à jour d'utilisateur (publiées par user-service)
    await connectRabbitMQ({
      queue: 'user_updated',
      handler: handleUserUpdate,
      queueOptions: { durable: true },
      qos: { prefetchCount: 1 },
    });

    logger.info('Connexion et consommation des messages RabbitMQ démarrées pour auth-service');
  } catch (error) {
    logger.error(`Erreur lors de l'initialisation de RabbitMQ dans auth-service: ${error}`);
    throw error;
  }
};

// Envoyer un événement d'authentification à la file auth_events
export const sendAuthEvent = async (event: { userId: number; username: string; role: string; action: string }) => {
  try {
    await sendToQueue('auth_events', JSON.stringify(event));
    logger.info(`Événement d'authentification envoyé à la file auth_events: ${JSON.stringify(event)}`);
  } catch (error) {
    logger.error(`Erreur lors de l'envoi de l'événement d'authentification: ${error}`);
  }
};

// Exporter closeRabbitMQ pour gérer la fermeture propre
export { closeRabbitMQ };