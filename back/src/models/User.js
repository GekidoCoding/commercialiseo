/**
 * Modèle User avec validation et méthodes améliorées
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Veuillez entrer une adresse email valide',
      ],
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Le nom d\'utilisateur est requis'],
      trim: true,
      minlength: [2, 'Le nom d\'utilisateur doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
      select: false, // Ne pas inclure par défaut dans les requêtes
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: 'Rôle {VALUE} non supporté',
      },
      default: ROLES.ACHETEUR,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Index composé pour les recherches fréquentes
userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ createdAt: -1 });

/**
 * Hash le mot de passe avant sauvegarde
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Méthode pour comparer les mots de passe
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Méthode pour mettre à jour le dernier login
 */
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

/**
 * Méthode statique pour trouver un utilisateur vérifié par email
 */
userSchema.statics.findVerifiedByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isVerified: true });
};

/**
 * Méthode statique pour trouver un utilisateur non vérifié par email
 */
userSchema.statics.findUnverifiedByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isVerified: false });
};

/**
 * Méthode statique pour vérifier si un email existe
 */
userSchema.statics.emailExists = async function (email) {
  const count = await this.countDocuments({ email: email.toLowerCase() });
  return count > 0;
};


/**
 * dhajdbaj Méthode pour obtenir le profil public
 */
userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    role: this.role,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
