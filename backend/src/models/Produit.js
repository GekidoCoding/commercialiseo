/**
 * Modèle Produit avec validation et méthodes améliorées
 */

const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    prix: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
      validate: {
        validator: function (v) {
          return v >= 0 && /^(\d+(\.\d{1,2})?)$/.test(v.toString());
        },
        message: 'Le prix doit avoir au maximum 2 décimales',
      },
    },
    quantite: {
      type: Number,
      default: 0,
      min: [0, 'La quantité ne peut pas être négative'],
      validate: {
        validator: Number.isInteger,
        message: 'La quantité doit être un nombre entier',
      },
    },
    categorie: {
      type: String,
      trim: true,
      index: true,
    },
    images: [{
      type: String,
      trim: true,
    }],
    actif: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index pour la recherche
produitSchema.index({ nom: 'text', description: 'text' });
produitSchema.index({ categorie: 1, prix: 1 });
produitSchema.index({ createdAt: -1 });

// Virtual pour vérifier la disponibilité
produitSchema.virtual('enStock').get(function () {
  return this.quantite > 0;
});

// Virtual pour formater le prix
produitSchema.virtual('prixFormate').get(function () {
  return `${this.prix.toFixed(2)} €`;
});

/**
 * Méthode pour vérifier la disponibilité
 */
produitSchema.methods.estDisponible = function (quantiteDemandee = 1) {
  return this.actif && this.quantite >= quantiteDemandee;
};

/**
 * Méthode pour réduire le stock
 */
produitSchema.methods.reduireStock = async function (quantite) {
  if (this.quantite < quantite) {
    throw new Error('Stock insuffisant');
  }
  this.quantite -= quantite;
  return this.save();
};

/**
 * Méthode pour augmenter le stock
 */
produitSchema.methods.augmenterStock = async function (quantite) {
  this.quantite += quantite;
  return this.save();
};

/**
 * Méthode statique pour rechercher des produits
 */
produitSchema.statics.rechercher = function (terme, options = {}) {
  const query = { actif: true };

  if (terme) {
    query.$text = { $search: terme };
  }

  if (options.categorie) {
    query.categorie = options.categorie;
  }

  if (options.prixMin !== undefined || options.prixMax !== undefined) {
    query.prix = {};
    if (options.prixMin !== undefined) query.prix.$gte = options.prixMin;
    if (options.prixMax !== undefined) query.prix.$lte = options.prixMax;
  }

  if (options.enStock) {
    query.quantite = { $gt: 0 };
  }

  return this.find(query);
};

/**
 * Méthode statique pour obtenir les produits par catégorie
 */
produitSchema.statics.findByCategorie = function (categorie, options = {}) {
  const query = { categorie, actif: true };

  if (options.enStock) {
    query.quantite = { $gt: 0 };
  }

  return this.find(query).sort({ createdAt: -1 });
};

/**
 * Méthode pour obtenir un résumé du produit
 */
produitSchema.methods.toSummary = function () {
  return {
    id: this._id,
    nom: this.nom,
    prix: this.prix,
    prixFormate: this.prixFormate,
    categorie: this.categorie,
    enStock: this.enStock,
    image: this.images?.[0] || null,
  };
};

module.exports = mongoose.model('Produit', produitSchema);
