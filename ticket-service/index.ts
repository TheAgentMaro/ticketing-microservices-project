import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import ticketRoutes from './routes/ticketRoutes';
import { initTicketTable } from './models/ticketModel';
import logger from './utils/logger';
import dotenv from 'dotenv';
import path from 'path';
import { connectRabbitMQ, closeRabbitMQ } from './utils/rabbitmq'; // Importer les fonctions RabbitMQ

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Charger la documentation Swagger
try {
  const swaggerDocument = yaml.load('./swagger.yaml');
  
  // Route explicite pour la documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  // Route alternative au cas où
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  // Route de test pour vérifier que l'API est en fonctionnement
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'ticket-service' });
  });
  
  // Simple redirection vers la documentation
  app.get('/', (req, res) => {
    res.redirect('/api-docs');
  });
} catch (error) {
  logger.error(`Erreur lors du chargement de la documentation Swagger: ${error}`);
}

app.use('/api/tickets', ticketRoutes);

const startServer = async () => {
  try {
    await initTicketTable();
    logger.info('Tableau des billets initialisé');
    
    try {
      await connectRabbitMQ(); // Appeler la fonction pour démarrer la connexion et la consommation
      logger.info('Connexion et consommation des messages RabbitMQ démarrées');
    } catch (rmqError) {
      logger.warn(`Service démarré sans connexion à RabbitMQ: ${rmqError}`);
    }
    
    const server = app.listen(PORT, () => {
      logger.info(`Service de billetterie démarré sur le port ${PORT}`);
    });

    // Gérer la fermeture gracieuse
    const shutdown = async () => {
      logger.info('Arrêt du serveur en cours...');
      try {
        await closeRabbitMQ(); // Fermer la connexion RabbitMQ
        logger.info('Connexion RabbitMQ fermée avec succès');
      } catch (error) {
        logger.error(`Erreur lors de la fermeture de RabbitMQ: ${error}`);
      }
      server.close(() => {
        logger.info('Serveur arrêté');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown); // Ctrl+C
    process.on('SIGTERM', shutdown); // Termination signal
  } catch (error) {
    logger.error(`Erreur au démarrage : ${error}`);
    process.exit(1);
  }
};

startServer();