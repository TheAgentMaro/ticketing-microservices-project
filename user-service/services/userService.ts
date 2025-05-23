import { User, getAllUsers, getUserById, updateUser, deleteUser, createUser } from '../models/userModel';
import logger from '../utils/logger';
import bcrypt from 'bcrypt'; // Assurez-vous d'avoir bcrypt dans vos dépendances

/**
 * Créer un utilisateur
 * @param user Données de l'utilisateur (username, role, password)
 * @returns L'utilisateur créé
 */
export const createUserService = async (user: { username: string; role: string; password: string }): Promise<User> => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10); // Hash du mot de passe
    const newUser = await createUser({ username: user.username, role: user.role as any, password: hashedPassword });
    logger.info(`Utilisateur créé avec succès : ${newUser.id}`);
    return newUser;
  } catch (error) {
    logger.error(`Erreur lors de la création de l'utilisateur : ${error}`);
    throw error;
  }
};

/**
 * Récupérer tous les utilisateurs
 * @returns Liste des utilisateurs
 */
export const getAllUsersService = async (): Promise<User[]> => {
  try {
    const users = await getAllUsers();
    logger.info('Utilisateurs récupérés avec succès');
    return users;
  } catch (error) {
    logger.error(`Erreur lors de la récupération des utilisateurs : ${error}`);
    throw error;
  }
};

/**
 * Récupérer un utilisateur par ID
 * @param id ID de l'utilisateur
 * @returns L'utilisateur ou null
 */
export const getUserByIdService = async (id: number): Promise<User | null> => {
  try {
    const user = await getUserById(id);
    if (!user) logger.warn(`Utilisateur non trouvé pour l'ID : ${id}`);
    return user;
  } catch (error) {
    logger.error(`Erreur lors de la récupération de l'utilisateur ${id} : ${error}`);
    throw error;
  }
};

/**
 * Mettre à jour un utilisateur
 * @param id ID de l'utilisateur
 * @param user Nouvelles données
 * @returns L'utilisateur mis à jour
 */
export const updateUserService = async (id: number, user: Partial<User>): Promise<User | null> => {
  try {
    const updatedUser = await updateUser(id, user);
    if (updatedUser) {
      logger.info(`Utilisateur mis à jour : ${id}`);
    } else {
      logger.warn(`Utilisateur non trouvé pour mise à jour : ${id}`);
    }
    return updatedUser;
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'utilisateur ${id} : ${error}`);
    throw error;
  }
};

/**
 * Supprimer un utilisateur
 * @param id ID de l'utilisateur
 * @returns Nombre de lignes supprimées
 */
export const deleteUserService = async (id: number): Promise<number> => {
  try {
    const rowCount = await deleteUser(id);
    if (rowCount > 0) {
      logger.info(`Utilisateur supprimé : ${id}`);
    } else {
      logger.warn(`Utilisateur non trouvé pour suppression : ${id}`);
    }
    return rowCount;
  } catch (error) {
    logger.error(`Erreur lors de la suppression de l'utilisateur ${id} : ${error}`);
    throw error;
  }
};