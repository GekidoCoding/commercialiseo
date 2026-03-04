/**
 * Service d'envoi d'emails centralisé
 * Utilise SendGrid comme provider d'envoi
 */

const sgMail = require('@sendgrid/mail');
const { AUTH_MESSAGES } = require('../constants/messages');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants/httpStatus');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() { }

  /**
   * Envoie un email via SendGrid
   * @param {Object} options
   * @param {string} options.to - Destinataire
   * @param {string} options.subject - Sujet
   * @param {string} [options.text] - Contenu texte
   * @param {string} [options.html] - Contenu HTML
   */
  async sendEmail({ to, subject, text, html }) {
    if (!process.env.SENDGRID_API_KEY) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Service email SendGrid non configuré'
      );
    }

    if (!to || !subject) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        AUTH_MESSAGES.REQUIRED_FIELDS || 'Paramètres email incomplets'
      );
    }

    const msg = {
      to,
      from: process.env.EMAIL_FROM || 'arijesafanirina@gmail.com',
      subject,
      text: text || '',
      html: html || '',
    };

    try {
      await sgMail.send(msg);
      console.log(`📧 Email envoyé à ${to} ✅`);
    } catch (error) {
      console.error('❌ Erreur SendGrid:', error.response?.body || error.message);
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        AUTH_MESSAGES.EMAIL_SEND_ERROR || "Erreur lors de l'envoi de l'email"
      );
    }
  }

  async sendVerificationCode(email, code, expiresInMinutes = 4) {
    const subject = 'Code de vérification - Commercialiseo';
    const text = `Bonjour,\n\nVotre code de vérification est : ${code}\n\nCe code est valide pendant ${expiresInMinutes} minutes.\n\nCordialement,\nL'équipe Commercialiseo`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Code de vérification</h2>
        <p>Bonjour,</p>
        <p>Votre code de vérification est :</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Ce code est valide pendant <strong>${expiresInMinutes} minutes</strong>.</p>
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">L'équipe Commercialiseo</p>
      </div>`;
    return this.sendEmail({ to: email, subject, text, html });
  }

  async sendPasswordResetCode(email, code, expiresInMinutes = 2) {
    const subject = 'Récupération de mot de passe - Commercialiseo';
    const text = `Bonjour,\n\nVotre code de récupération est : ${code}\n\nCe code est valide pendant ${expiresInMinutes} minutes.\n\nCordialement,\nL'équipe Commercialiseo`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Récupération de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Votre code de récupération est :</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Ce code est valide pendant <strong>${expiresInMinutes} minutes</strong>.</p>
        <p style="color: #e74c3c;">Si vous n'avez pas demandé cette récupération, sécurisez votre compte.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">L'équipe Commercialiseo</p>
      </div>`;
    return this.sendEmail({ to: email, subject, text, html });
  }

  async sendWelcomeEmail(email, username) {
    const subject = 'Bienvenue sur Commercialiseo !';
    const text = `Bonjour ${username},\n\nBienvenue sur Commercialiseo ! Votre compte a été créé avec succès.\n\nCordialement,\nL'équipe Commercialiseo`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bienvenue sur Commercialiseo !</h2>
        <p>Bonjour <strong>${username}</strong>,</p>
        <p>Votre compte a été créé avec succès.</p>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <ul>
            <li>Parcourir notre catalogue de produits</li>
            <li>Ajouter des articles à votre panier</li>
            <li>Passer des commandes</li>
          </ul>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">L'équipe Commercialiseo</p>
      </div>`;
    return this.sendEmail({ to: email, subject, text, html });
  }
}

module.exports = new EmailService();