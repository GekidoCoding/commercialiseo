/**
 * Constantes pour les rôles utilisateurs
 */

const ROLES = {
  ADMIN: 'admin',
  BOUTIQUE: 'boutique',
  ACHETEUR: 'acheteur',
};

const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.BOUTIQUE]: 'Boutique',
  [ROLES.ACHETEUR]: 'Acheteur',
};

const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Gérer la plateforme',
  [ROLES.BOUTIQUE]: 'Vendre des produits',
  [ROLES.ACHETEUR]: 'Acheter des produits',
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.BOUTIQUE]: 2,
  [ROLES.ACHETEUR]: 1,
};

module.exports = {
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_HIERARCHY,
};
