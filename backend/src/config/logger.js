/**
 * Logger Configuration
 * Utilise Winston pour un logging structuré
 */

const winston = require('winston');
const path = require('path');

// Définir les niveaux de log personnalisés
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Définir les couleurs pour chaque niveau
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Ajouter les couleurs à winston
winston.addColors(colors);

// Format personnalisé
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Format pour les fichiers (sans couleurs)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json()
);

// Déterminer le niveau de log en fonction de l'environnement
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

// Créer les transports
const transports = [
  // Console
  new winston.transports.Console({
    format,
  }),
];

// Ajouter les fichiers de log en production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: path.join('logs', 'app.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Fichier pour les erreurs uniquement
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Créer le logger
const logger = winston.createLogger({
  level,
  levels,
  transports,
  exitOnError: false,
});

// Stream pour Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
