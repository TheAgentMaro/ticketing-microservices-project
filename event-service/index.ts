import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import eventRoutes from './routes/eventRoutes';
import { initEventTable } from './models/eventModel';
import logger from './utils/logger';
import dotenv from 'dotenv';
import pool from './config/db';

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

// Fonction pour tester la connexion à la base de données
const testDatabaseConnection = async (retries = 5, delay = 5000) => {
  let attempts = 0;
  
  while (attempts < retries) {
    try {
      logger.info(`Tentative de connexion à la base de données (${attempts + 1}/${retries})...`);
      await pool.query('SELECT 1');
      logger.info('Connexion à la base de données établie avec succès!');
      return true;
    } catch (error) {
      attempts++;
      logger.error(`Échec de la connexion à la base de données: ${error}`);
      
      if (attempts < retries) {
        logger.info(`Nouvelle tentative dans ${delay/1000} secondes...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
};

// Initialiser la base de données et démarrer le serveur
const startServer = async () => {
  try {
    // Attendre que la base de données soit prête
    const isConnected = await testDatabaseConnection();
    
    if (!isConnected) {
      throw new Error('Impossible de se connecter à la base de données après plusieurs tentatives');
    }
    
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