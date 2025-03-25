import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

// Configuration de la connexion à MySQL avec variables sécurisées
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Ticket010203',
  database: process.env.DB_NAME || 'ticketing',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;