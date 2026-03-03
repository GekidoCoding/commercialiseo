/**
 * Service acheteur
 * Centralise la logique métier des achats
 */

const mongoose = require('mongoose');
const Variant = require('../models/write/variant');
const Product = require('../models/write/product');
const User = require('../models/write/users');
const authService = require('./authService');
const histoProductService = require('./histoProductService');
const pushNotificationService = require('./pushNotificationService');
const reconstructService = require('./reconstructService');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { ROLES } = require('../constants/roles');

class AcheteurService {
  /**
   * Confirme un achat avec vérification du mot de passe, mise à jour du stock,
   * enregistrement dans l'historique et envoi de notifications
   * @param {string} acheteurId - ID de l'acheteur
   * @param {string} password - Mot de passe de l'acheteur
   * @param {Array<Object>} variants - Liste des variants avec quantités
   * @returns {Promise<Object>} Résultat de l'achat
   */
  async confirmPurchase(acheteurId, password, variants) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Étape 1 : Vérification du mot de passe
      try {
        await authService.verifyPassword(acheteurId, password);
      } catch (error) {
        throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Mot de passe incorrect');
      }

      // Récupérer les informations de l'acheteur
      const acheteur = await User.findById(acheteurId).session(session);
      if (!acheteur) {
        throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Acheteur non trouvé');
      }

      // Récupérer tous les administrateurs pour les notifications
      const admins = await User.find({ role: ROLES.ADMIN }).session(session);

      console.log("variants purchased :" +JSON.stringify(variants));
      // Collecter les productId uniques pour reconstruction
      const productIdsToReconstruct = new Set();

      // Traiter chaque variant
      for (const item of variants) {
        const { variantId, quantity } = item;

        // Étape 2.1 : Récupérer le variant
        const variant = await Variant.findById(variantId).session(session);
        if (!variant) {
          throw new ApiError(HTTP_STATUS.NOT_FOUND, `Variant avec l'ID ${variantId} non trouvé`);
        }

        // Vérifier le stock
        if (variant.stock < quantity) {
          throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `Stock insuffisant pour le variant ${variant.code}. Disponible: ${variant.stock}, Demandé: ${quantity}`
          );
        }

        // Étape 2.2 : Calculer le stock
        const stockBefore = variant.stock;
        const stockAfter = stockBefore - quantity;

        // Récupérer le produit associé
        const product = await Product.findById(variant.productId).session(session);
        if (!product) {
          throw new ApiError(HTTP_STATUS.NOT_FOUND, `Produit associé au variant ${variant.code} non trouvé`);
        }

        // Ajouter le productId pour reconstruction
        productIdsToReconstruct.add(variant.productId.toString());

        // Récupérer le propriétaire de la boutique (vendeur)
        const vendeur = await User.findById(variant.userId).session(session);
        const boutiqueName = vendeur ? vendeur.username : 'Boutique inconnue';

        // Étape 2.3 : Mettre à jour le variant
        variant.stock = stockAfter;
        variant.lastUpdated = new Date();
        await variant.save({ session });

        // Étape 3 : Enregistrer dans l'historique
        const now = new Date();
        await histoProductService.create({
          userBuyed: acheteurId,
          variant: variant._id,
          product: product._id,
          stockBefore,
          stockAfter,
          quantity,
          action: 'achat',
          date: now,
        });

        // Étape 4 : Créer les notifications
        const dateStr = now.toLocaleString('fr-FR');

        // Notification 1 : Boutique (propriétaire du variant) - catégorie 'vente'
        await pushNotificationService.create({
          userId: variant.userId,
          message: `Vente de ${quantity} ${product.name} (${variant.code}) par ${acheteur.username} le ${dateStr}`,
          category: 'vente',
        });

        // Notification 2 : Acheteur - catégorie 'achat'
        await pushNotificationService.create({
          userId: acheteurId,
          message: `Achat de ${quantity} ${product.name} (${variant.code}) effectué avec succès`,
          category: 'achat',
        });

        // Notification 3 : Administrateurs - catégorie 'mouvement'
        for (const admin of admins) {
          await pushNotificationService.create({
            userId: admin._id,
            message: `Le stock de ${product.name} (${variant.code}) de ${boutiqueName} a diminué de ${quantity} par ${acheteur.username}`,
            category: 'mouvement',
          });
        }
      }

      // Valider la transaction
      await session.commitTransaction();

      return {
        message: 'Achat effectué avec succès',
        success: true,
        productIdsToReconstruct: Array.from(productIdsToReconstruct),
      };
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new AcheteurService();
