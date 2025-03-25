import pool from '../config/db';
import bcrypt from 'bcrypt';

export interface User {
  id?: number;
  username: string;
  password: string;
  role: 'admin' | 'event_creator' | 'operator' | 'user';
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
 * Créer un utilisateur avec mot de passe hashé
 * @param user Données de l'utilisateur
 * @returns L'utilisateur créé
 */
export const createUser = async (user: User): Promise<User> => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  const [result] = await pool.query(query, [user.username, hashedPassword, user.role]);
  const insertId = (result as any).insertId;
  return { id: insertId, username: user.username, password: hashedPassword, role: user.role };
};

/**
 * Trouver un utilisateur par nom d'utilisateur
 * @param username Nom d'utilisateur
 * @returns L'utilisateur ou null
 */
export const findUserByUsername = async (username: string): Promise<User | null> => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  const users = rows as User[];
  return users.length > 0 ? users[0] : null;
};