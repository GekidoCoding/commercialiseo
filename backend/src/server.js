/**
 * Point d'entrée du serveur
 * Démarre l'application et gère les erreurs de démarrage
 */

require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('❌ ERREUR NON CAPTUREE:', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ PROMESSE REJETEE NON GEREE:', err);
  process.exit(1);
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Démarrage du serveur HTTP
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Serveur démarré sur http://${HOST}:${PORT}`);
      console.log(`📁 Environnement: ${process.env.NODE_ENV || 'development'}`);

      console.log(`email.env success: ${process.env.EMAIL_USER}`);
      console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);

    });

    // Gestion gracieuse de l'arrêt
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM reçu. Arrêt gracieux...');
      server.close(() => {
        console.log('🔌 Serveur HTTP fermé');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

startServer();
