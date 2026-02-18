/**
 * Schémas de validation pour les produits
 */

const Joi = require('joi');

const produitValidation = {
  /**
   * Validation de la création d'un produit
   */
  create: Joi.object({
    nom: Joi.string()
      .min(2)
      .max(100)
      .required()
      .trim()
      .messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 100 caractères',
        'string.empty': 'Le nom du produit est requis',
        'any.required': 'Le nom du produit est requis',
      }),
    description: Joi.string()
      .max(2000)
      .allow('', null)
      .trim()
      .messages({
        'string.max': 'La description ne peut pas dépasser 2000 caractères',
      }),
    prix: Joi.number()
      .min(0)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Le prix ne peut pas être négatif',
        'number.base': 'Le prix doit être un nombre',
        'number.precision': 'Le prix ne peut avoir que 2 décimales',
        'any.required': 'Le prix est requis',
      }),
    quantite: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .messages({
        'number.integer': 'La quantité doit être un nombre entier',
        'number.min': 'La quantité ne peut pas être négative',
      }),
    categorie: Joi.string()
      .max(50)
      .allow('', null)
      .trim()
      .messages({
        'string.max': 'La catégorie ne peut pas dépasser 50 caractères',
      }),
    images: Joi.array()
      .items(Joi.string().uri().trim())
      .default([])
      .messages({
        'string.uri': 'Les images doivent être des URLs valides',
      }),
    actif: Joi.boolean().default(true),
  }),

  /**
   * Validation de la mise à jour d'un produit
   */
  update: Joi.object({
    nom: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .messages({
        'string.min': 'Le nom doit contenir au moins 2 caractères',
        'string.max': 'Le nom ne peut pas dépasser 100 caractères',
      }),
    description: Joi.string()
      .max(2000)
      .allow('', null)
      .trim()
      .messages({
        'string.max': 'La description ne peut pas dépasser 2000 caractères',
      }),
    prix: Joi.number()
      .min(0)
      .precision(2)
      .messages({
        'number.min': 'Le prix ne peut pas être négatif',
        'number.base': 'Le prix doit être un nombre',
        'number.precision': 'Le prix ne peut avoir que 2 décimales',
      }),
    quantite: Joi.number()
      .integer()
      .min(0)
      .messages({
        'number.integer': 'La quantité doit être un nombre entier',
        'number.min': 'La quantité ne peut pas être négative',
      }),
    categorie: Joi.string()
      .max(50)
      .allow('', null)
      .trim()
      .messages({
        'string.max': 'La catégorie ne peut pas dépasser 50 caractères',
      }),
    images: Joi.array()
      .items(Joi.string().uri().trim())
      .messages({
        'string.uri': 'Les images doivent être des URLs valides',
      }),
    actif: Joi.boolean(),
  }).min(1).messages({
    'object.min': 'Au moins un champ doit être fourni pour la mise à jour',
  }),

  /**
   * Validation des paramètres de recherche
   */
  search: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .messages({
        'string.min': 'Le terme de recherche doit contenir au moins 1 caractère',
        'string.max': 'Le terme de recherche ne peut pas dépasser 100 caractères',
      }),
    categorie: Joi.string().trim(),
    prixMin: Joi.number().min(0).messages({
      'number.min': 'Le prix minimum ne peut pas être négatif',
    }),
    prixMax: Joi.number().min(0).messages({
      'number.min': 'Le prix maximum ne peut pas être négatif',
    }),
    enStock: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1).messages({
      'number.integer': 'La page doit être un nombre entier',
      'number.min': 'La page doit être au moins 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.integer': 'La limite doit être un nombre entier',
      'number.min': 'La limite doit être au moins 1',
      'number.max': 'La limite ne peut pas dépasser 100',
    }),
    sort: Joi.string().valid('prix_asc', 'prix_desc', 'date_asc', 'date_desc', 'nom_asc', 'nom_desc').default('date_desc'),
  }),

  /**
   * Validation de l'ID MongoDB
   */
  id: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'ID invalide',
        'string.empty': 'L\'ID est requis',
        'any.required': 'L\'ID est requis',
      }),
  }),
};

module.exports = produitValidation;
