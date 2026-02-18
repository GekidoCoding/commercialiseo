/**
 * Modèle VerificationCode avec validation et méthodes améliorées
 */

const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Le code est requis'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['registration', 'password_reset'],
      default: 'registration',
    },
    expiresAt: {
      type: Date,
      required: [true, 'La date d\'expiration est requise'],
    },
    used: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
      max: [5, 'Trop de tentatives'],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour nettoyage automatique des codes expirés
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationCodeSchema.index({ email: 1, code: 1 });

/**
 * Vérifie si le code est valide
 */
verificationCodeSchema.methods.isValid = function () {
  return !this.used && this.expiresAt > new Date() && this.attempts < 5;
};

/**
 * Marque le code comme utilisé
 */
verificationCodeSchema.methods.markAsUsed = async function () {
  this.used = true;
  return this.save();
};

/**
 * Incrémente le compteur de tentatives
 */
verificationCodeSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  return this.save();
};

/**
 * Méthode statique pour trouver un code valide
 */
verificationCodeSchema.statics.findValidCode = function (email, code) {
  return this.findOne({
    email: email.toLowerCase(),
    code,
    used: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 },
  });
};

/**
 * Méthode statique pour supprimer tous les codes d'un email
 */
verificationCodeSchema.statics.deleteByEmail = function (email) {
  return this.deleteMany({ email: email.toLowerCase() });
};

/**
 * Méthode statique pour compter les codes récents (rate limiting)
 */
verificationCodeSchema.statics.countRecentCodes = async function (email, minutes = 10) {
  const depuis = new Date(Date.now() - minutes * 60 * 1000);
  return this.countDocuments({
    email: email.toLowerCase(),
    createdAt: { $gte: depuis },
  });
};

/**
 * Méthode statique pour créer un nouveau code
 */
verificationCodeSchema.statics.createCode = async function (email, code, type = 'registration', expiresInMinutes = 4) {
  // Supprimer les anciens codes
  await this.deleteByEmail(email);

  // Créer le nouveau code
  return this.create({
    email: email.toLowerCase(),
    code,
    type,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  });
};

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
