import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

// Routes pour l’authentification
router.post('/register', register); // Inscription
router.post('/login', login);       // Connexion

export default router;