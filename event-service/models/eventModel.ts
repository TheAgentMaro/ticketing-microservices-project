import pool from '../config/db';

// Interface pour un événement
export interface Event {
  id?: number;
  name: string;
  date: string;
  max_tickets: number;
}

/**
 * Créer la table des événements si elle n'existe pas
 */
export const initEventTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      date DATETIME NOT NULL,
      max_tickets INT NOT NULL
    );
  `;
  await pool.query(query);
};

/**
 * Créer un événement dans la base de données
 * @param event Données de l'événement
 * @returns L'événement créé
 */
export const createEvent = async (event: Event): Promise<Event> => {
  const query = 'INSERT INTO events (name, date, max_tickets) VALUES (?, ?, ?)';
  const [result] = await pool.query(query, [event.name, event.date, event.max_tickets]);
  const insertId = (result as any).insertId; // Récupérer l'ID inséré
  return { id: insertId, ...event };
};

/**
 * Récupérer tous les événements
 * @returns Liste des événements
 */
export const getAllEvents = async (): Promise<Event[]> => {
  const [rows] = await pool.query('SELECT * FROM events');
  return rows as Event[];
};

/**
 * Récupérer un événement par ID
 * @param id ID de l'événement
 * @returns L'événement ou null si non trouvé
 */
export const getEventById = async (id: number): Promise<Event | null> => {
  const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
  const events = rows as Event[];
  return events.length > 0 ? events[0] : null;
};

/**
 * Mettre à jour un événement
 * @param id ID de l'événement
 * @param event Nouvelles données
 * @returns L'événement mis à jour
 */
export const updateEvent = async (id: number, event: Event): Promise<Event | null> => {
  const query = 'UPDATE events SET name = ?, date = ?, max_tickets = ? WHERE id = ?';
  const [result] = await pool.query(query, [event.name, event.date, event.max_tickets, id]);
  const affectedRows = (result as any).affectedRows;
  if (affectedRows === 0) return null;
  return { id, ...event };
};

/**
 * Supprimer un événement
 * @param id ID de l'événement
 * @returns Nombre de lignes supprimées
 */
export const deleteEvent = async (id: number): Promise<number> => {
  const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);
  return (result as any).affectedRows;
};