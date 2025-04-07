import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, createUser, findUserByUsername } from '../models/userModel';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'microservices';

/**
 * Inscrire un nouvel utilisateur
 * @param user Données de l'utilisateur
 * @returns L'utilisateur créé
 */
export const registerUser = async (user: User): Promise<User> => {
  try {
    const existingUser = await findUserByUsername(user.username);
    if (existingUser) {
      logger.warn(`Tentative d'inscription avec un username existant : ${user.username}`);
      throw new Error('Utilisateur déjà existant');
    }
    const newUser = await createUser(user);
    logger.info(`Utilisateur inscrit avec succès : ${newUser.username}`);
    return newUser;
  } catch (error) {
    logger.error(`Erreur lors de l'inscription : ${error}`);
    throw error;
  }
};

/**
 * Connecter un utilisateur et générer un token JWT
 * @param username Nom d'utilisateur
 * @param password Mot de passe
 * @returns Token JWT
 */
export const loginUser = async (username: string, password: string): Promise<string> => {
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      logger.warn(`Tentative de connexion avec un username inexistant : ${username}`);
      throw new Error('Utilisateur non trouvé');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Mot de passe incorrect pour l'utilisateur : ${username}`);
      throw new Error('Mot de passe incorrect');
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: '30h',
    });
    logger.info(`Utilisateur connecté avec succès : ${username}`);
    return token;
  } catch (error) {
    logger.error(`Erreur lors de la connexion : ${error}`);
    throw error;
  }
};