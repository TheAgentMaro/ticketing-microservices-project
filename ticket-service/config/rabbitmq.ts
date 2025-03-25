import amqp from 'amqplib';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

// URL de connexion RabbitMQ avec fallback en cas d'erreur
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
let channel: any | null = null;

interface Channel {
  assertQueue(queue: string, options?: { durable: boolean }): Promise<any>;
  sendToQueue(queue: string, content: Buffer, options?: { persistent: boolean }): boolean;
  consume(queue: string, onMessage: (msg: ConsumeMessage | null) => void, options?: { noAck: boolean }): Promise<any>;
  ack(message: ConsumeMessage): void;
}

interface ConsumeMessage {
  content: Buffer;
  fields: any;
  properties: any;
}

const connectRabbitMQ = async (): Promise<Channel> => {
  if (channel) return channel;
  try {
    logger.info(`Tentative de connexion à RabbitMQ: ${RABBITMQ_URL}`);
    const connection = await amqp.connect(RABBITMQ_URL);
    
    // Gérer la fermeture de la connexion
    connection.on('error', (err: Error) => {
      logger.error(`Erreur de connexion RabbitMQ: ${err}`);
      channel = null;
    });
    
    connection.on('close', () => {
      logger.warn('Connexion RabbitMQ fermée, tentative de reconnexion dans 5 secondes');
      channel = null;
      setTimeout(connectRabbitMQ, 5000);
    });
    
    channel = await connection.createChannel();
    await channel.assertQueue('ticket_confirmation', { durable: true });
    logger.info('Connexion à RabbitMQ établie');
    return channel;
  } catch (error) {
    logger.error(`Erreur de connexion à RabbitMQ : ${error}`);
    throw error;
  }
};

/**
 * Envoyer un message à la file pour confirmation
 * @param message Message à envoyer
 */
export const sendToQueue = async (message: string) => {
  try {
    const ch = await connectRabbitMQ();
    ch.sendToQueue('ticket_confirmation', Buffer.from(message), { persistent: true });
  } catch (error) {
    logger.error(`Impossible d'envoyer le message à RabbitMQ: ${error}`);
    // Ne pas propager l'erreur pour éviter de bloquer le service
  }
};

/**
 * Consommer les messages de la file (simulation email/SMS)
 */
export const consumeQueue = async () => {
  try {
    const ch = await connectRabbitMQ();
    ch.consume('ticket_confirmation', (msg: ConsumeMessage | null) => {
      if (msg) {
        const content = msg.content.toString();
        logger.info(`Confirmation envoyée (simulation) : ${content}`);
        ch.ack(msg);
      }
    }, { noAck: false });
  } catch (error) {
    logger.error(`Impossible de consommer les messages RabbitMQ: ${error}`);
    throw error;
  }
};