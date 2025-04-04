import { connectRabbitMQ, sendToQueue, closeRabbitMQ } from '@ticketing/rabbitmq';
import logger from './logger';

// Fonction pour gérer les événements d'authentification (publiés par auth-service)
const handleAuthEvent = async (msg: any) => {
  const event = JSON.parse(msg.toString());
  logger.info(`Événement d'authentification reçu dans user-service : ${JSON.stringify(event)}`);
  // Exemple : Créer un profil utilisateur ou effectuer une action après une inscription/connexion
  // Vous pouvez ajouter ici une logique pour réagir à l'inscription ou la connexion
};

// Fonction pour gérer les mises à jour d'utilisateur (pour d'autres services)
const handleUserUpdate = async (msg: any) => {
  const update = JSON.parse(msg.toString());
  logger.info(`Mise à jour d'utilisateur reçue : ${JSON.stringify(update)}`);
  // Exemple : Si un autre service consomme cette file, il peut réagir à la mise à jour
};

// Initialiser la connexion et les consommateurs pour user-service
export const initRabbitMQ = async () => {
  try {
    // Consommer les événements d'authentification (publiés par auth-service)
    await connectRabbitMQ({
      queue: 'auth_events',
      handler: handleAuthEvent,
      queueOptions: { durable: true },
      qos: { prefetchCount: 1 },
    });

    // Consommer les mises à jour d'utilisateur (peut être utilisé pour des cas futurs)
    await connectRabbitMQ({
      queue: 'user_updated',
      handler: handleUserUpdate,
      queueOptions: { durable: true },
      qos: { prefetchCount: 1 },
    });

    logger.info('Connexion et consommation des messages RabbitMQ démarrées pour user-service');
  } catch (error) {
    logger.error(`Erreur lors de l'initialisation de RabbitMQ dans user-service: ${error}`);
    throw error;
  }
};

// Envoyer une mise à jour d'utilisateur à la file user_updated
export const sendUserUpdate = async (update: { userId: number; action: string; details?: any }) => {
  try {
    await sendToQueue('user_updated', JSON.stringify(update));
    logger.info(`Mise à jour d'utilisateur envoyée à la file user_updated: ${JSON.stringify(update)}`);
  } catch (error) {
    logger.error(`Erreur lors de l'envoi de la mise à jour d'utilisateur: ${error}`);
  }
};

// Exporter closeRabbitMQ pour gérer la fermeture propre
export { closeRabbitMQ };