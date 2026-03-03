/**
 * Service d'envoi d'emails centralisé
 * Utilise le pattern Singleton pour éviter la création multiple de transports
 */

//const nodemailer = require('nodemailer');

const { AUTH_MESSAGES } = require('../constants/messages');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async sendEmail({ to, subject, text, html }) {
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_RESEND_USER) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Service email Resend non configuré'
      );
    }

    if (!to || !subject || (!text && !html)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Paramètres email incomplets'
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const mailOptions = {
      from: `"Commercialiseo" <${process.env.EMAIL_RESEND_USER}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      const result = await resend.emails.send(mailOptions);
      console.log(JSON.stringify(result));
      console.log(`📧 Email envoyé à ${to}: ${result.id}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi email (Resend):', error.message);
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        AUTH_MESSAGES.EMAIL_SEND_ERROR
      );
    }
  }


  /**
   * Initialise le transporteur nodemailer
   */
  initializeTransporter() {
    /*console.log('Initialize transporter');
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Configuration email manquante. Les emails ne seront pas envoyés.');
      return;
    }
    console.log('Creating transporter');
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    // Vérifier la connexion au démarrage
    this.verifyConnection();*/
  }

  /**
   * Vérifie la connexion au serveur SMTP
   */
  async verifyConnection() {
    /*if (!this.transporter) return false;

    try {
      await this.transporter.verify();
      console.log('✅ Connexion au serveur email vérifiée');
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion serveur email:', error.message);
      return false;
    }*/

    return false;
  }

  /**
   * Envoie un email
   * @param {Object} options - Options de l'email
   * @param {string} options.to - Destinataire
   * @param {string} options.subject - Sujet
   * @param {string} options.text - Contenu texte
   * @param {string} [options.html] - Contenu HTML
   * @returns {Promise<Object>} Résultat de l'envoi
   */
  /*async sendEmail({ to, subject, text, html }) {
    if (!this.transporter) {
      throw new ApiError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'Service email non configuré'
      );
    }

    if (!to || !subject || (!text && !html)) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        'Paramètres email incomplets'
      );
    }

    const mailOptions = {
      from: `"Commercialiseo" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email envoyé à ${to}: ${result.messageId}`);
      return result;
    } catch (error) {
      console.error('❌ Erreur envoi email:', error.message);
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        AUTH_MESSAGES.EMAIL_SEND_ERROR
      );
    }
    return null
  }*/

  /**
   * Envoie un email de vérification avec code
   * @param {string} email - Email du destinataire
   * @param {string} code - Code de vérification
   * @param {number} [expiresInMinutes=4] - Durée de validité en minutes
   */
  async sendVerificationCode(email, code, expiresInMinutes = 4) {
    const subject = 'Code de vérification - Commercialiseo';
    const text = `Bonjour,

Votre code de vérification est : ${code}

Ce code est valide pendant ${expiresInMinutes} minutes.

Si vous n'avez pas demandé ce code, veuillez ignorer cet email.

Cordialement,
L'équipe Commercialiseo`;

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
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }

  /**
   * Envoie un email de récupération de mot de passe
   * @param {string} email - Email du destinataire
   * @param {string} code - Code de récupération
   * @param {number} [expiresInMinutes=2] - Durée de validité en minutes
   */
  async sendPasswordResetCode(email, code, expiresInMinutes = 2) {
    const subject = 'Récupération de mot de passe - Commercialiseo';
    const text = `Bonjour,

Vous avez demandé la récupération de votre mot de passe.

Votre code de récupération est : ${code}

Ce code est valide pendant ${expiresInMinutes} minutes.

Si vous n'avez pas demandé cette récupération, veuillez ignorer cet email et sécuriser votre compte.

Cordialement,
L'équipe Commercialiseo`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Récupération de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demandé la récupération de votre mot de passe.</p>
        <p>Votre code de récupération est :</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Ce code est valide pendant <strong>${expiresInMinutes} minutes</strong>.</p>
        <p style="color: #e74c3c;">Si vous n'avez pas demandé cette récupération, veuillez ignorer cet email et sécuriser votre compte.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">L'équipe Commercialiseo</p>
      </div>
    `;

    return this.sendWithResend({ to: email, subject, text, html });
  }

  /**
   * Envoie un email de bienvenue après vérification
   * @param {string} email - Email du destinataire
   * @param {string} username - Nom d'utilisateur
   */
  async sendWelcomeEmail(email, username) {
    const subject = 'Bienvenue sur Commercialiseo !';
    const text = `Bonjour ${username},

Bienvenue sur Commercialiseo ! Votre compte a été créé avec succès.

Vous pouvez maintenant :
- Parcourir notre catalogue de produits
- Ajouter des articles à votre panier
- Passer des commandes

Cordialement,
L'équipe Commercialiseo`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bienvenue sur Commercialiseo !</h2>
        <p>Bonjour <strong>${username}</strong>,</p>
        <p>Votre compte a été créé avec succès.</p>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">Vous pouvez maintenant :</p>
          <ul>
            <li>Parcourir notre catalogue de produits</li>
            <li>Ajouter des articles à votre panier</li>
            <li>Passer des commandes</li>
          </ul>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">L'équipe Commercialiseo</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }
}

// Exporte une instance singleton
module.exports = new EmailService();
