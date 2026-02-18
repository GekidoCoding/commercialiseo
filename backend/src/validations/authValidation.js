/**
 * Schémas de validation pour l'authentification
 * Utilise Joi pour la validation des requêtes
 */

const Joi = require('joi');
const { ROLES } = require('../constants/roles');

// Regex pour la validation du mot de passe
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;

const authValidation = {
  /**
   * Validation de la demande d'inscription
   */
  registerRequest: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis',
      }),
    username: Joi.string()
      .min(2)
      .max(50)
      .required()
      .trim()
      .messages({
        'string.min': 'Le nom d\'utilisateur doit contenir au moins 2 caractères',
        'string.max': 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères',
        'string.empty': 'Le nom d\'utilisateur est requis',
        'any.required': 'Le nom d\'utilisateur est requis',
      }),
    password: Joi.string()
      .min(8)
      .pattern(passwordRegex)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis',
      }),
    role: Joi.string()
      .valid(...Object.values(ROLES))
      .default(ROLES.ACHETEUR)
      .messages({
        'any.only': 'Rôle invalide',
      }),
  }),

  /**
   * Validation de la vérification du code
   */
  verifyCode: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis',
      }),
    code: Joi.string()
      .length(7)
      .pattern(/^\d{5}[A-Z]{2}$/)
      .required()
      .messages({
        'string.length': 'Le code doit contenir 7 caractères',
        'string.pattern.base': 'Le code doit être au format 5 chiffres suivis de 2 lettres majuscules (ex: 12345AB)',
        'string.empty': 'Le code est requis',
        'any.required': 'Le code est requis',
      }),
  }),

  /**
   * Validation de la connexion
   */
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis',
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis',
      }),
  }),

  /**
   * Validation de la demande de code de récupération
   */
  sendCodePassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis',
      }),
    isPasswordUpdate: Joi.boolean().default(false),
  }),

  /**
   * Validation du changement de mot de passe
   */
  changePassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis',
      }),
    password: Joi.string()
      .min(8)
      .pattern(passwordRegex)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial',
        'string.empty': 'Le mot de passe est requis',
        'any.required': 'Le mot de passe est requis',
      }),
    code: Joi.string()
      .length(7)
      .pattern(/^\d{5}[A-Z]{2}$/)
      .required()
      .messages({
        'string.length': 'Le code doit contenir 7 caractères',
        'string.pattern.base': 'Le code doit être au format 5 chiffres suivis de 2 lettres majuscules (ex: 12345AB)',
        'string.empty': 'Le code est requis',
        'any.required': 'Le code est requis',
      }),
  }),

  /**
   * Validation du rafraîchissement de token
   */
  newAccessToken: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'string.empty': 'L\'email est requis',
        'any.required': 'L\'email est requis',
      }),
  }),
};

module.exports = authValidation;
