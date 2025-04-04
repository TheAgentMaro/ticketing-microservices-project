import { Connection, Consumer } from 'rabbitmq-client';
import logger from './logger';
import dotenv from 'dotenv';

dotenv.config();

// Récupérer l'URL de RabbitMQ depuis les variables d'environnement
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

// Variables pour stocker la connexion et le consommateur
let rabbit: Connection | null = null;
let consumer: Consumer | null = null;

// Fonction pour établir une connexion à RabbitMQ
export const connectRabbitMQ = async (): Promise<void> => {
  try {
    if (rabbit && consumer) {
      return;
    }

    // Établir une nouvelle connexion
    rabbit = new Connection(RABBITMQ_URL);

    // Gérer les erreurs de connexion
    rabbit.on('error', (err) => {
      logger.error(`Erreur de connexion RabbitMQ: ${err.message}`);
      rabbit = null;
      consumer = null;
    });

    rabbit.on('connection', () => {
      logger.info('Connexion à RabbitMQ établie avec succès');
    });

    (rabbit as any).on('close', () => {
      logger.info('Connexion RabbitMQ fermée par le serveur');
      rabbit = null;
      consumer = null;
    });

    // Créer un consommateur
    consumer = rabbit.createConsumer(
      {
        queue: 'ticket_confirmation',
        queueOptions: { durable: true },
        qos: { prefetchCount: 1 },
      },
      async (msg) => {
        const content = msg.body.toString();
        logger.info(`Confirmation envoyée (simulation) : ${content}`);
        // Le message est automatiquement acquitté (ack) par défaut
      }
    );

    consumer.on('error', (err) => {
      logger.error(`Erreur du consommateur RabbitMQ: ${err.message}`);
      consumer = null;
    });

    logger.info(`Consommation des messages démarrée sur la file ticket_confirmation`);
  } catch (error) {
    logger.error(`Erreur lors de la connexion à RabbitMQ: ${error}`);
    throw error;
  }
};

// Fonction pour envoyer un message à la file
export const sendToQueue = async (message: string) => {
  try {
    if (!rabbit) {
      await connectRabbitMQ();
    }
    if (!rabbit) {
      throw new Error('Connexion RabbitMQ non établie');
    }

    const publisher = rabbit.createPublisher({
      confirm: true, // Attendre la confirmation du serveur
    });

    await publisher.send(
      'ticket_confirmation',
      Buffer.from(message)
    );

    logger.info(`Message envoyé à la file ticket_confirmation: ${message}`);
    await publisher.close();
  } catch (error) {
    logger.error(`Impossible d'envoyer le message à RabbitMQ: ${error}`);
  }
};

// Fonction pour fermer la connexion
export const closeRabbitMQ = async () => {
  try {
    if (consumer) {
      await consumer.close();
      consumer = null;
    }
    if (rabbit) {
      await rabbit.close();
      rabbit = null;
    }
    logger.info('Connexion à RabbitMQ fermée');
  } catch (error) {
    logger.error(`Erreur lors de la fermeture de RabbitMQ: ${error}`);
  }
};