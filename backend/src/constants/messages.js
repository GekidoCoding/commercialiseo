/**
 * Messages d'erreur et de succès centralisés
 * Permet une gestion cohérente des messages dans toute l'application
 */

const AUTH_MESSAGES = {
  // Success
  REGISTER_SUCCESS: 'Code envoyé par email. Veuillez vérifier votre boîte de réception.',
  LOGIN_SUCCESS: 'Connexion réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
  CODE_SENT: 'Code envoyé par email',
  ACCOUNT_VERIFIED: 'Compte créé avec succès',
  TOKEN_REFRESHED: 'Token rafraîchi avec succès',

  // Errors
  EMAIL_ALREADY_EXISTS: 'Cet email a déjà un compte, connectez-vous',
  USER_NOT_FOUND: 'Utilisateur introuvable',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  EMAIL_INEXISTS: 'Email inexistant , créez un compte',
  INVALID_TOKEN: 'Token invalide ou expiré',
  TOKEN_REQUIRED: 'Token d\'authentification requis',
  INVALID_CODE: 'Code invalide',
  EXPIRED_CODE: 'Code expiré',
  EMAIL_NOT_FOUND: 'Cet e-mail n\'a pas de compte',
  PASSWORD_UPDATE_ERROR: 'Impossible de modifier le mot de passe',
  NO_UNVERIFIED_USER: 'Aucun utilisateur non vérifié trouvé',
  EMAIL_SEND_ERROR: 'Email inexistant ou impossible d\'envoyer le code',
  SERVER_ERROR: 'Erreur serveur, veuillez réessayer plus tard',
  PASSWORD_INCORRECT: 'Mot de passe incorrect',
  UNAUTHORIZED: 'Non autorisé',
};

const USER_MESSAGES = {
  // Validation
  INVALID_EMAIL: 'Veuillez entrer une adresse email valide',
  INVALID_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial',
  PASSWORDS_DONT_MATCH: 'Les mots de passe ne correspondent pas',
  USERNAME_REQUIRED: 'Le nom d\'utilisateur est requis',
  ROLE_REQUIRED: 'Le rôle est requis',
  INVALID_ROLE: 'Rôle invalide',
};

const PRODUCT_MESSAGES = {
  // Success
  PRODUCT_CREATED: 'Produit créé avec succès',
  PRODUCT_UPDATED: 'Produit mis à jour avec succès',
  PRODUCT_DELETED: 'Produit supprimé avec succès',

  // Errors
  PRODUCT_NOT_FOUND: 'Produit non trouvé',
  INVALID_PRODUCT_DATA: 'Données du produit invalides',
  NAME_REQUIRED: 'Le nom du produit est requis',
  PRICE_REQUIRED: 'Le prix du produit est requis',
  INVALID_PRICE: 'Le prix doit être un nombre positif',
};

const COMMON_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation',
  INTERNAL_ERROR: 'Une erreur interne est survenue',
};

module.exports = {
  AUTH_MESSAGES,
  USER_MESSAGES,
  PRODUCT_MESSAGES,
  COMMON_MESSAGES,
};
