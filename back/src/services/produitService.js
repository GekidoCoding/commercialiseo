/**
 * Service de gestion des produits
 * Centralise la logique métier des produits
 */

const Produit = require('../models/Produit');
const { PRODUCT_MESSAGES } = require('../constants/messages');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants/httpStatus');

class ProduitService {
  /**
   * Crée un nouveau produit
   */
  async create(produitData, userId = null) {
    const produit = await Produit.create({
      ...produitData,
      createdBy: userId,
    });

    return {
      message: PRODUCT_MESSAGES.PRODUCT_CREATED,
      produit: produit.toSummary(),
    };
  }

  /**
   * Récupère tous les produits avec pagination et filtres
   */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      categorie,
      enStock,
      prixMin,
      prixMax,
      q,
    } = options;

    // Construire la requête
    const query = { actif: true };

    if (categorie) {
      query.categorie = categorie;
    }

    if (enStock !== undefined) {
      query.quantite = enStock ? { $gt: 0 } : 0;
    }

    if (prixMin !== undefined || prixMax !== undefined) {
      query.prix = {};
      if (prixMin !== undefined) query.prix.$gte = prixMin;
      if (prixMax !== undefined) query.prix.$lte = prixMax;
    }

    if (q) {
      query.$text = { $search: q };
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    // Exécuter la requête
    const [produits, total] = await Promise.all([
      Produit.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Produit.countDocuments(query),
    ]);

    return {
      produits: produits.map((p) => ({
        ...p,
        enStock: p.quantite > 0,
        prixFormate: `${p.prix.toFixed(2)} €`,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Récupère un produit par son ID
   */
  async findById(id) {
    const produit = await Produit.findById(id);

    if (!produit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, PRODUCT_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return produit;
  }

  /**
   * Récupère un résumé du produit par son ID
   */
  async findSummaryById(id) {
    const produit = await Produit.findById(id);

    if (!produit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, PRODUCT_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return produit.toSummary();
  }

  /**
   * Met à jour un produit
   */
  async update(id, updateData) {
    const produit = await Produit.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!produit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, PRODUCT_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return {
      message: PRODUCT_MESSAGES.PRODUCT_UPDATED,
      produit: produit.toSummary(),
    };
  }

  /**
   * Supprime un produit (soft delete)
   */
  async delete(id) {
    const produit = await Produit.findByIdAndUpdate(
      id,
      { actif: false },
      { new: true }
    );

    if (!produit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, PRODUCT_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return {
      message: PRODUCT_MESSAGES.PRODUCT_DELETED,
    };
  }

  /**
   * Supprime définitivement un produit
   */
  async hardDelete(id) {
    const produit = await Produit.findByIdAndDelete(id);

    if (!produit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, PRODUCT_MESSAGES.PRODUCT_NOT_FOUND);
    }

    return {
      message: PRODUCT_MESSAGES.PRODUCT_DELETED,
    };
  }

  /**
   * Recherche des produits
   */
  async search(terme, options = {}) {
    const query = { actif: true };

    if (terme) {
      query.$or = [
        { nom: { $regex: terme, $options: 'i' } },
        { description: { $regex: terme, $options: 'i' } },
      ];
    }

    if (options.categorie) {
      query.categorie = options.categorie;
    }

    if (options.enStock) {
      query.quantite = { $gt: 0 };
    }

    const produits = await Produit.find(query)
      .sort(options.sort || '-createdAt')
      .limit(options.limit || 20);

    return produits.map((p) => p.toSummary());
  }

  /**
   * Récupère les produits par catégorie
   */
  async findByCategorie(categorie, options = {}) {
    return Produit.findByCategorie(categorie, options);
  }

  /**
   * Met à jour le stock d'un produit
   */
  async updateStock(id, quantite, operation = 'add') {
    const produit = await Produit.findById(id);

    if (!produit) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, PRODUCT_MESSAGES.PRODUCT_NOT_FOUND);
    }

    if (operation === 'add') {
      await produit.augmenterStock(quantite);
    } else if (operation === 'remove') {
      await produit.reduireStock(quantite);
    } else {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Opération invalide');
    }

    return produit.toSummary();
  }

  /**
   * Récupère les statistiques des produits
   */
  async getStats() {
    const stats = await Produit.aggregate([
      { $match: { actif: true } },
      {
        $group: {
          _id: null,
          totalProduits: { $sum: 1 },
          valeurStock: { $sum: { $multiply: ['$prix', '$quantite'] } },
          produitsEnStock: {
            $sum: { $cond: [{ $gt: ['$quantite', 0] }, 1, 0] },
          },
          prixMoyen: { $avg: '$prix' },
        },
      },
    ]);

    const parCategorie = await Produit.aggregate([
      { $match: { actif: true } },
      {
        $group: {
          _id: '$categorie',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      general: stats[0] || {
        totalProduits: 0,
        valeurStock: 0,
        produitsEnStock: 0,
        prixMoyen: 0,
      },
      parCategorie,
    };
  }
}

module.exports = new ProduitService();
