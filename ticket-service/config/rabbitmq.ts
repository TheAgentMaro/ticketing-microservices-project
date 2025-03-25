import amqp from 'amqplib';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
let channel: amqp.Channel | null = null;

const connectRabbitMQ = async (): Promise<amqp.Channel> => {
  if (channel) return channel;
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
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
  const ch = await connectRabbitMQ();
  ch.sendToQueue('ticket_confirmation', Buffer.from(message), { persistent: true });
};

/**
 * Consommer les messages de la file (simulation email/SMS)
 */
export const consumeQueue = async () => {
  const ch = await connectRabbitMQ();
  ch.consume('ticket_confirmation', (msg) => {
    if (msg) {
      const content = msg.content.toString();
      logger.info(`Confirmation envoyée (simulation) : ${content}`);
      ch.ack(msg);
    }
  }, { noAck: false });
};