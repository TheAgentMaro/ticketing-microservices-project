import { Connection, Consumer } from 'rabbitmq-client';
import logger from './logger'; // À ajuster selon le service
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

// Interface pour les options de connexion
interface RabbitMQConfig {
  queue: string;
  handler: (msg: any) => Promise<void>;
  queueOptions?: { durable?: boolean };
  qos?: { prefetchCount?: number };
}

// Variables pour stocker les connexions et consommateurs
const connections: Map<string, Connection> = new Map();
const consumers: Map<string, Consumer> = new Map();

// Fonction pour établir une connexion et un consommateur
export const connectRabbitMQ = async (config: RabbitMQConfig): Promise<void> => {
  const { queue, handler, queueOptions = { durable: true }, qos = { prefetchCount: 1 } } = config;
  try {
    if (connections.has(queue) && consumers.has(queue)) {
      return;
    }

    const rabbit = new Connection(RABBITMQ_URL);

    rabbit.on('error', (err) => {
      logger.error(`Erreur de connexion RabbitMQ pour la file ${queue}: ${err.message}`);
      connections.delete(queue);
      consumers.delete(queue);
      // Tentative de reconnexion
      setTimeout(() => connectRabbitMQ(config), 5000);
    });

    rabbit.on('connection', () => {
      logger.info(`Connexion à RabbitMQ établie pour la file ${queue}`);
    });

    // Supprimer l'écouteur pour 'closed' car il n'est pas supporté
    // À la place, on gère la fermeture via l'événement 'error'

    const consumer = rabbit.createConsumer(
      {
        queue,
        queueOptions,
        qos,
      },
      async (msg) => {
        try {
          await handler(msg.body);
        } catch (error) {
          logger.error(`Erreur lors du traitement du message dans la file ${queue}: ${error}`);
          // Rejeter le message sans le remettre dans la file
          throw error; // Le consommateur gérera le rejet automatiquement
        }
      }
    );

    consumer.on('error', (err) => {
      logger.error(`Erreur du consommateur RabbitMQ pour la file ${queue}: ${err.message}`);
      consumers.delete(queue);
      // Tentative de reconnexion
      setTimeout(() => connectRabbitMQ(config), 5000);
    });

    connections.set(queue, rabbit);
    consumers.set(queue, consumer);

    logger.info(`Consommation des messages démarrée sur la file ${queue}`);
  } catch (error) {
    logger.error(`Erreur lors de la connexion à RabbitMQ pour la file ${queue}: ${error}`);
    throw error;
  }
};

// Fonction pour envoyer un message à une file
export const sendToQueue = async (queue: string, message: string) => {
  let rabbit: Connection | undefined;
  let publisher: any;

  try {
    rabbit = connections.get(queue);
    if (!rabbit) {
      // Si la connexion n'existe pas, créer une nouvelle connexion temporaire
      rabbit = new Connection(RABBITMQ_URL);
      rabbit.on('error', (err) => {
        logger.error(`Erreur de connexion RabbitMQ (envoi) pour la file ${queue}: ${err.message}`);
      });
    }

    publisher = rabbit.createPublisher({
      confirm: true,
    });

    await publisher.send(queue, Buffer.from(message));

    logger.info(`Message envoyé à la file ${queue}: ${message}`);
  } catch (error) {
    logger.error(`Impossible d'envoyer le message à RabbitMQ pour la file ${queue}: ${error}`);
    throw error;
  } finally {
    if (publisher) {
      await publisher.close();
    }
    // Ne pas fermer la connexion si elle est partagée
    if (rabbit && !connections.has(queue)) {
      await rabbit.close();
    }
  }
};

// Fonction pour fermer toutes les connexions
export const closeRabbitMQ = async () => {
  try {
    for (const [queue, consumer] of consumers.entries()) {
      await consumer.close();
      consumers.delete(queue);
    }
    for (const [queue, connection] of connections.entries()) {
      await connection.close();
      connections.delete(queue);
    }
    logger.info('Toutes les connexions RabbitMQ fermées');
  } catch (error) {
    logger.error(`Erreur lors de la fermeture de RabbitMQ: ${error}`);
  }
};