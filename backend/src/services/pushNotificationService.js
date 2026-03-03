/**
 * Service de notifications push
 * Centralise la logique métier de création des notifications
 */

const PushNotifications = require('../models/write/push_notification');

class PushNotificationService {
  /**
   * Crée une notification push
   * @param {Object} notificationData - Les données de la notification
   * @param {string} notificationData.userId - ID du destinataire
   * @param {string} notificationData.message - Message de la notification
   * @param {string} [notificationData.category] - ID de la catégorie de notification (optionnel)
   * @returns {Promise<Object>} La notification créée
   */
  async create(notificationData) {
    const { userId, message, category } = notificationData;

    const notification = await PushNotifications.create({
      userId,
      message,
      ...(category && { category }),
    });

    return notification;
  }

  /**
   * Crée plusieurs notifications en une seule opération
   * @param {Array<Object>} notificationsData - Tableau des données de notifications
   * @returns {Promise<Array<Object>>} Les notifications créées
   */
  async createMany(notificationsData) {
    return await PushNotifications.insertMany(notificationsData);
  }

  /**
   * Marque une notification comme lue
   * @param {string} id - ID de la notification
   * @returns {Promise<Object>} La notification mise à jour
   */
  async markRead(id) {
    const notification = await PushNotifications.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true, runValidators: true }
    );

    if (!notification) {
      throw new Error('Notification non trouvée');
    }

    return notification;
  }

  /**
   * Récupère les notifications non lues d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Array<Object>>} Les notifications non lues
   */
  async findNotificationsByUserId(userId) {
    return PushNotifications.find({
      userId,
      isRead: false,
    }).sort({createdAt: -1});
  }
}

module.exports = new PushNotificationService();
