import pool from '../config/db';

export interface Ticket {
  id?: number;
  event_id: number;
  user_id: number;
  ticket_number: string;
  purchase_date: string;
}

/**
 * Initialiser la table des billets
 */
export const initTicketTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      ticket_number VARCHAR(50) NOT NULL UNIQUE,
      purchase_date DATETIME NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `;
  await pool.query(query);
};

/**
 * Vérifier le nombre de billets disponibles pour un événement
 * @param eventId ID de l'événement
 * @returns Nombre de billets restants
 */
export const getAvailableTickets = async (eventId: number): Promise<number> => {
  const [eventRows] = await pool.query('SELECT max_tickets FROM events WHERE id = ?', [eventId]);
  const event = eventRows as { max_tickets: number }[];
  if (!event.length) return -1;

  const [ticketRows] = await pool.query('SELECT COUNT(*) as count FROM tickets WHERE event_id = ?', [eventId]);
  const ticketCount = (ticketRows as { count: number }[])[0].count;
  return event[0].max_tickets - ticketCount;
};

/**
 * Créer un billet
 * @param ticket Données du billet
 * @returns Le billet créé
 */
export const createTicket = async (ticket: Ticket): Promise<Ticket> => {
  const query = 'INSERT INTO tickets (event_id, user_id, ticket_number, purchase_date) VALUES (?, ?, ?, ?)';
  const [result] = await pool.query(query, [ticket.event_id, ticket.user_id, ticket.ticket_number, ticket.purchase_date]);
  const insertId = (result as any).insertId;
  return { id: insertId, ...ticket };
};

/**
 * Récupérer les billets d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des billets
 */
export const getTicketsByUser = async (userId: number): Promise<Ticket[]> => {
  const [rows] = await pool.query('SELECT * FROM tickets WHERE user_id = ?', [userId]);
  return rows as Ticket[];
};