  /**
 * Service d'historique des produits
 * Centralise la logique métier de l'enregistrement des actions sur les produits
 */

const HistoProduct = require('../models/write/histo_product');

class HistoProductService {
  /**
   * Crée un enregistrement dans l'historique des produits
   * @param {Object} histoData - Les données de l'historique
   * @param {string} histoData.userBuyed - ID de l'acheteur
   * @param {string} histoData.variant - ID du variant
   * @param {string} histoData.product - ID du produit
   * @param {number} histoData.stockBefore - Stock avant l'action
   * @param {number} histoData.stockAfter - Stock après l'action
   * @param {number} histoData.quantity - Quantité concernée
   * @param {string} histoData.action - Type d'action (ex: "achat")
   * @param {Date} histoData.date - Date de l'action
   * @returns {Promise<Object>} L'enregistrement créé
   */
  async create(histoData) {
    const { userBuyed, variant, product, stockBefore, stockAfter, quantity, action, date } = histoData;

    const histoRecord = await HistoProduct.create({
      userBuyed,
      variant,
      product,
      stockBefore,
      stockAfter,
      quantity,
      action,
      date,
    });

    return histoRecord;
  }
}

module.exports = new HistoProductService();
