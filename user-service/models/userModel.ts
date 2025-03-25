import pool from '../config/db';

export interface User {
  id?: number;
  username: string;
  role: 'admin' | 'event_creator' | 'operator' | 'user';
  password?: string; // Ajouté pour la création
}

/**
 * Initialiser la table des utilisateurs
 */
export const initUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'event_creator', 'operator', 'user') NOT NULL
    );
  `;
  await pool.query(query);
};

/**
 * Créer un utilisateur
 * @param user Données de l'utilisateur
 * @returns L'utilisateur créé
 */
export const createUser = async (user: { username: string; role: string; password: string }): Promise<User> => {
  const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  const [result] = await pool.query(query, [user.username, user.password, user.role]);
  const insertId = (result as any).insertId;
  return { id: insertId, username: user.username, role: user.role as any };
};

/**
 * Récupérer tous les utilisateurs
 * @returns Liste des utilisateurs
 */
export const getAllUsers = async (): Promise<User[]> => {
  const [rows] = await pool.query('SELECT id, username, role FROM users');
  return rows as User[];
};

/**
 * Récupérer un utilisateur par ID
 * @param id ID de l'utilisateur
 * @returns L'utilisateur ou null
 */
export const getUserById = async (id: number): Promise<User | null> => {
  const [rows] = await pool.query('SELECT id, username, role FROM users WHERE id = ?', [id]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
};

/**
 * Mettre à jour un utilisateur
 * @param id ID de l'utilisateur
 * @param user Nouvelles données
 * @returns L'utilisateur mis à jour
 */
export const updateUser = async (id: number, user: Partial<User>): Promise<User | null> => {
  const query = 'UPDATE users SET username = ?, role = ? WHERE id = ?';
  const [result] = await pool.query(query, [user.username, user.role, id]);
  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) return null;
  return { id, ...user } as User;
};

/**
 * Supprimer un utilisateur
 * @param id ID de l'utilisateur
 * @returns Nombre de lignes supprimées
 */
export const deleteUser = async (id: number): Promise<number> => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return (result as any).affectedRows;
};