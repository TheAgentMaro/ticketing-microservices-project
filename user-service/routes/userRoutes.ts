import express from 'express';
import { getUsers, getUser, updateUser, deleteUser, createUser, getCurrentUser } from '../controllers/userController';
import { authenticateToken, restrictToAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Routes protégées par JWT
router.post('/', authenticateToken, restrictToAdmin, createUser);     // Créer un utilisateur (admin)
router.get('/', authenticateToken, restrictToAdmin, getUsers);        // Lister tous les utilisateurs (admin)
router.get('/me', authenticateToken, getCurrentUser);                 // Récupérer ses propres données
router.get('/:id', authenticateToken, getUser);                       // Récupérer un utilisateur
router.put('/:id', authenticateToken, restrictToAdmin, updateUser);   // Mettre à jour un utilisateur (admin)
router.delete('/:id', authenticateToken, restrictToAdmin, deleteUser); // Supprimer un utilisateur (admin)

export default router;