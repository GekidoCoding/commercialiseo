/**
 * Générateur de codes de vérification
 * Supporte différents formats et longueurs
 */

/**
 * Génère un code numérique aléatoire
 * @param {number} length - Longueur du code (défaut: 6)
 * @returns {string} Code généré
 */
const generateNumericCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Génère un code alphanumérique aléatoire
 * @param {number} length - Longueur du code (défaut: 8)
 * @returns {string} Code généré
 */
const generateAlphanumericCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Génère un code de vérification au format 5 chiffres + 2 lettres majuscules (ex: 98752BX)
 * @returns {string} Code généré
 */
const generateCode = () => {
  const numbers = generateNumericCode(5);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 2; i++) {
    suffix += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return numbers + suffix;
};

/**
 * Génère un token de réinitialisation sécurisé
 * @returns {string} Token généré
 */
const generateResetToken = () => {
  return generateAlphanumericCode(32);
};

module.exports = {
  generateCode,
  generateNumericCode,
  generateAlphanumericCode,
  generateResetToken,
};