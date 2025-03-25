import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import authRoutes from './routes/authRoutes';
import { initUserTable } from './models/userModel';
import logger from './utils/logger';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route de test pour vérifier que l'API est en fonctionnement
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

try {
  const swaggerDocument = yaml.load('./swagger.yaml');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  logger.error(`Erreur lors du chargement de la documentation Swagger: ${error}`);
}

app.use('/api/auth', authRoutes);

const startServer = async () => {
  try {
    await initUserTable();
    logger.info('Tableau des utilisateurs initialisé');
    app.listen(PORT, () => {
      logger.info(`Service d'authentification démarré sur le port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Erreur au démarrage : ${ error}`);
  }
};

startServer();