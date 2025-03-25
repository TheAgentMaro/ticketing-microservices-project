import express from 'express';
import eventRoutes from './routes/eventRoutes';

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes pour les événements
app.use('/api/events', eventRoutes);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Service événement démarré sur le port ${PORT}`);
});