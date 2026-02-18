/**
 * Service d'authentification
 * Centralise la logique métier de l'authentification
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const emailService = require('./emailService');
const { generateCode } = require('../utils/generateCode');
const { AUTH_MESSAGES } = require('../constants/messages');
const { ROLES } = require('../constants/roles');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../constants/httpStatus');

class AuthService {
  /**
   * Demande d'inscription - envoie un code de vérification
   */
  async registerRequest(email, username, password, role = ROLES.ACHETEUR) {
    // Vérifier si l'email existe déjà et est vérifié
    const existingUser = await User.findVerifiedByEmail(email);
    if (existingUser) {
      throw new ApiError(HTTP_STATUS.CONFLICT, AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Vérifier le rate limiting (max 3 codes par 10 minutes)
    const recentCodes = await VerificationCode.countRecentCodes(email, 10);
    if (recentCodes >= 3) {
      throw new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        'Trop de tentatives. Veuillez réessayer dans 10 minutes.'
      );
    }

    // Supprimer l'ancien utilisateur non vérifié s'il existe
    await User.deleteMany({ email: email.toLowerCase(), isVerified: false });

    // Créer le nouvel utilisateur non vérifié (le mot de passe sera hashé par le middleware pre-save)
    const newUser = await User.create({
      email: email.toLowerCase(),
      username: username,
      password: password,
      role: role,
      isVerified: false,
    });

    // Générer et sauvegarder le code
    const code = generateCode();
    await VerificationCode.createCode(email, code, 'registration', 4);

    // Envoyer l'email
    await emailService.sendVerificationCode(email, code, 4);

    return {
      message: AUTH_MESSAGES.CODE_SENT,
      email: newUser.email,
    };
  }

  /**
   * Vérifie le code et active le compte
   */
  async verifyCode(email, code) {
    const record = await VerificationCode.findOne({
      email:email ,
      code:code,
    });

    if (!record) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_CODE);
    }

    // Vérifier l'expiration
    if (record.expiresAt < new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.EXPIRED_CODE);
    }

    // Activer l'utilisateur
    const updatedUser = await User.findOneAndUpdate(
      { email: record.email.toLowerCase(), isVerified: false },
      { $set: { isVerified: true } },
      { sort: { createdAt: -1 }, returnDocument: 'after' }
    );

    if (!updatedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.NO_UNVERIFIED_USER);
    }

    // Marquer le code comme utilisé
    await record.markAsUsed();

    // Nettoyer les anciens codes et utilisateurs non vérifiés
    await VerificationCode.deleteByEmail(email);
    await User.deleteMany({
      email: record.email.toLowerCase(),
      isVerified: false,
    });

    // Envoyer email de bienvenue
    try {
      await emailService.sendWelcomeEmail(updatedUser.email, updatedUser.username);
    } catch (error) {
      console.warn('⚠️ Impossible d\'envoyer l\'email de bienvenue:', error.message);
    }

    return {
      message: AUTH_MESSAGES.ACCOUNT_VERIFIED,
      user: updatedUser.toPublicProfile(),
    };
  }

  /**
   * Envoie un code de récupération de mot de passe
   */
  async sendPasswordResetCode(email, isPasswordUpdate = false) {
    const existingUser = await User.findOne({email:email});

    if (!existingUser && isPasswordUpdate) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.EMAIL_NOT_FOUND);
    }

    // Rate limiting
    const recentCodes = await VerificationCode.countRecentCodes(email, 10);
    if (recentCodes >= 3) {
      throw new ApiError(
        HTTP_STATUS.TOO_MANY_REQUESTS,
        'Trop de tentatives. Veuillez réessayer dans 10 minutes.'
      );
    }

    // Supprimer les anciens codes
    await VerificationCode.deleteMany({email});

    // Créer le nouveau code (valide 2 minutes)
    const code = generateCode();
    await VerificationCode.createCode(email, code, 'password_reset', 2);

    // Envoyer l'email
    await emailService.sendPasswordResetCode(email, code, 2);

    return {
      message: AUTH_MESSAGES.CODE_SENT,
    };
  }

  /**
   * Change le mot de passe avec un code de vérification
   */
  async changePasswordWithCode(email, newPassword, code) {
    const record = await VerificationCode.findValidCode(email, code);

    if (!record) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.INVALID_CODE);
    }

    if (record.expiresAt < new Date()) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, AUTH_MESSAGES.EXPIRED_CODE);
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    const updatedUser = await User.findOneAndUpdate(
      { email: record.email.toLowerCase(), isVerified: true },
      { password: hashedPassword },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    // Marquer le code comme utilisé
    await record.markAsUsed();

    return {
      message: AUTH_MESSAGES.PASSWORD_CHANGED,
    };
  }

  /**
   * Connexion utilisateur
   */
  async login(email, password) {
    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({
      email: email.toLowerCase(),
      isVerified: true,
    }).select('+password');

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.EMAIL_NOT_FOUND);
    }

    // Vérifier le mot de passe avec bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("taper:"+ password);
    console.log("isMatch:"+ isMatch);

    if (!isMatch) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.PASSWORD_INCORRECT);
    }

    // Mettre à jour le dernier login
    await user.updateLastLogin();

    // Générer le token
    const token = this.generateToken(user);

    return {
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
      token,
      user: user.toPublicProfile(),
    };
  }

  /**
   * Génère un nouveau token d'accès
   */
  async refreshToken(email) {
    const user = await User.findVerifiedByEmail(email);

    if (!user) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.USER_NOT_FOUND);
    }

    const token = this.generateToken(user);

    return {
      message: AUTH_MESSAGES.TOKEN_REFRESHED,
      token,
    };
  }

  /**
   * Génère un JWT
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,

      },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );
  }

  /**
   * Décode et vérifie un token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
    }
  }
}

module.exports = new AuthService();
