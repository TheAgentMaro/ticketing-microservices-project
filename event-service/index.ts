import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import eventRoutes from './routes/eventRoutes';
import { initEventTable } from './models/eventModel';
import logger from './utils/logger';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Charger la documentation Swagger
const swaggerDocument = yaml.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes pour les événements
app.use('/api/events', eventRoutes);

// Initialiser la base de données et démarrer le serveur
const startServer = async () => {
  try {
    await initEventTable();
    logger.info('Tableau des événements initialisé');
    app.listen(PORT, () => {
      logger.info(`Service événement démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Erreur au démarrage : ${error}`);
  }
};

startServer();