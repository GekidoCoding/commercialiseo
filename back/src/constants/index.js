/**
 * Constants Index
 * Exporte toutes les constantes
 */

const { HTTP_STATUS, HTTP_MESSAGES } = require('./httpStatus');
const { AUTH_MESSAGES, USER_MESSAGES, PRODUCT_MESSAGES, COMMON_MESSAGES } = require('./messages');
const { ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_HIERARCHY } = require('./roles');

module.exports = {
  // HTTP
  HTTP_STATUS,
  HTTP_MESSAGES,

  // Messages
  AUTH_MESSAGES,
  USER_MESSAGES,
  PRODUCT_MESSAGES,
  COMMON_MESSAGES,

  // Roles
  ROLES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_HIERARCHY,
};
