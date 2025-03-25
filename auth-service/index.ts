import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import authRoutes from './routes/authRoutes';
import { initUserTable } from './models/userModel';
import logger from './utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

const swaggerDocument = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/auth', authRoutes);

const startServer = async () => {
  try {
    await initUserTable();
    logger.info('Tableau des utilisateurs initialisé');
    app.listen(PORT, () => {
      logger.info(`Service d’authentification démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Erreur au démarrage : ${ error}`);
  }
};

startServer();