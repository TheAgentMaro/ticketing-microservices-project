import winston from 'winston';

// Configuration du logger avec Winston
const logger = winston.createLogger({
  level: 'info', // Niveau minimum de log (info, warn, error, etc.)
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Ajouter un timestamp
    winston.format.json() // Format JSON pour les logs
  ),
  transports: [
    // Écrire les erreurs dans error.log
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    }),
    // Écrire tous les logs (info, warn, error) dans combined.log
    new winston.transports.File({
      filename: 'combined.log',
    }),
    // Afficher les logs dans la console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorer les logs dans la console
        winston.format.simple() // Format simple pour la console
      ),
    }),
  ],
});

// Exportation du logger pour utilisation dans d'autres fichiers
export default logger;