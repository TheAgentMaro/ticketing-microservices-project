import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import ticketRoutes from './routes/ticketRoutes';
import { initTicketTable } from './models/ticketModel';
import { consumeQueue } from './config/rabbitmq';
import logger from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

const swaggerDocument = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/tickets', ticketRoutes);

const startServer = async () => {
  try {
    await initTicketTable();
    logger.info('Tableau des billets initialisé');
    await consumeQueue(); // Démarrer le consommateur RabbitMQ
    app.listen(PORT, () => {
      logger.info(`Service de billetterie démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Erreur au démarrage : ${error}`);
  }
};

startServer();