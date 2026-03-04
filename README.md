# 🛍️ Commercialiseo - Plateforme de Gestion de Centre Commercial

<div align="center">

**Plateforme numérique complète pour la gestion d'un centre commercial à Antananarivo**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/GekidoCoding/commercialiseo)
[![Angular](https://img.shields.io/badge/Angular-21.1.0-DD0031?logo=angular)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?logo=mongodb)](https://www.mongodb.com/)

[Démo en ligne](#-liens-utiles) • [Documentation](#-documentation) • [Fonctionnalités](#-fonctionnalités-principales)

</div>

---

## 📖 Table des Matières

- [Présentation](#-présentation)
- [Architecture Technique](#-architecture-technique)
- [Installation & Configuration](#-installation--configuration)
- [Démarrage Rapide](#-démarrage-rapide)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Guides Utilisateurs](#-guides-utilisateurs)
- [API & Endpoints](#-api--endpoints)
- [Déploiement](#-déploiement)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🎯 Présentation

**Commercialiseo** est une plateforme e-commerce tout-en-un qui connecte trois types d'utilisateurs :

- 👨‍💼 **Administrateurs** : Gèrent le catalogue central et supervisent l'ensemble du centre commercial
- 🏪 **Boutiques** : Créent leurs variantes de produits, gèrent les stocks et les promotions
- 🛒 **Acheteurs** : Parcourent les produits, comparent les offres et passent des commandes en ligne

### Objectifs Clés

✅ Centraliser la gestion des produits et catégories  
✅ Permettre aux boutiques de personnaliser leurs offres  
✅ Offrir une expérience d'achat fluide et sécurisée  
✅ Automatiser les notifications et validations  
✅ Fournir des tableaux de bord analytiques complets  

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Frontend
| Technologie | Version | Description |
|------------|---------|-------------|
| **Angular** | 21.1.0 | Framework principal |
| **TypeScript** | 5.9.2 | Langage de développement |
| **Angular Material** | 21.2.0 | Composants UI |
| **Bootstrap** | 5.3.8 | Grid system et utilitaires |
| **Font Awesome** | 7.2.0 | Iconographie |
| **RxJS** | 7.8.0 | Programmation réactive |

#### Backend
| Technologie | Version | Description |
|------------|---------|-------------|
| **Node.js** | >=18.0.0 | Runtime JavaScript |
| **Express** | 5.2.1 | Framework web |
| **MongoDB** | 6 | Base de données NoSQL |
| **Mongoose** | 9.2.1 | ODM MongoDB |
| **JWT** | 9.0.3 | Authentification |
| **Bcrypt** | 3.0.3 | Hachage mots de passe |
| **Nodemailer** | 8.0.1 | Service d'emails |
| **Winston** | 3.11.0 | Logging |
| **Multer** | 2.1.0 | Upload de fichiers |

#### Infrastructure
- **Docker** & **Docker Compose** : Conteneurisation
- **Nginx** : Reverse proxy (production)
- **Let's Encrypt** : Certificats SSL

### Schéma d'Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │ ◄─────► │  Frontend    │ ◄─────► │   Backend   │
│  (Browser)  │  HTTPS  │ Angular:4200 │   API   │ Express:5000│
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │   MongoDB   │
                                                 │   Port 27017│
                                                 └─────────────┘
```

---

## 🚀 Installation & Configuration

### Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- ✅ **Node.js** version 18.0.0 ou supérieure ([Télécharger](https://nodejs.org/))
- ✅ **npm** version 10.9.4 ou supérieure (inclus avec Node.js)
- ✅ **MongoDB** version 6 ou supérieure ([Guide d'installation](https://www.mongodb.com/docs/manual/installation/))
- ✅ **Git** pour cloner le dépôt ([Télécharger](https://git-scm.com/))
- ✅ **Docker** & **Docker Compose** (optionnel, pour déploiement conteneurisé)

### Option 1 : Installation Locale (Recommandée pour Développement)

#### 1. Cloner le Dépôt

```bash
git clone https://github.com/GekidoCoding/commercialiseo.git
cd commercialiseo
```

#### 2. Configuration du Backend

```bash
# Navigation vers le dossier backend
cd backend

# Installation des dépendances
npm install

# Création du fichier .env
copy .env.example .env
# ou sur Linux/Mac
cp .env.example .env
```

**Configuration du fichier `.env` :**

```env
# Serveur
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/commercialiseo

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici
JWT_EXPIRE=7d

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_application

# Frontend URL
FRONTEND_URL=http://localhost:4200
```

#### 3. Configuration du Frontend

```bash
# Retour à la racine
cd ..

# Navigation vers le dossier frontend
cd frontend

# Installation des dépendances
npm install
```

**Configuration du fichier `environment.ts` :**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  vitrineUrl: 'http://localhost:4200/auth/vitrine'
};
```

#### 4. Démarrage des Services

**Terminal 1 - Backend :**

```bash
cd backend
npm run dev
```

Le backend tourne sur **http://localhost:5000**

**Terminal 2 - Frontend :**

```bash
cd frontend
npm start
```

Le frontend tourne sur **http://localhost:4200**

**Terminal 3 - MongoDB (si non installé en service) :**

```bash
mongod --dbpath "C:\data\db"
# ou sur Linux/Mac
mongod --dbpath /data/db
```

---

### Option 2 : Docker (Recommandée pour Production/Test)

#### 1. Build et Lancement avec Docker Compose

```bash
# Build des images
docker-compose build

# Lancement des services
docker-compose up -d
```

#### 2. Vérification

```bash
# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Nettoyer volumes et réseaux
docker-compose down -v
```

**Services disponibles :**
- Frontend : **http://localhost:4200**
- Backend API : **http://localhost:5000**
- MongoDB : **mongodb://localhost:27017**

---

## 🔧 Commandes Utiles

### Backend

```bash
# Développement avec hot-reload
npm run dev

# Production
npm start

# Tests unitaires
npm test

# Tests en watch mode
npm run test:watch

# Linting
cd backend
npm run lint

# Formatage du code
npm run format
```

### Frontend

```bash
# Serveur de développement
npm start

# Build de production
npm run build

# Build en watch mode
npm run watch

# Tests unitaires
npm test
```

---

## ✨ Fonctionnalités Principales

### 1. Authentification & Vitrine Publique

#### 🏠 Vitrine Publique (`/auth/vitrine`)
Page d'accueil visible sans connexion présentant :
- Présentation du centre commercial
- Témoignages clients
- Coordonnées et contacts
- Boutons d'accès rapide (Connexion/Inscription)

![Vitrine](docs/screens/vitrine.png)

#### 📝 Inscription (`/auth/register`)
**Processus en 5 étapes :**

1. **Sélection du rôle** (Acheteur ou Boutique) - Obligatoire avant toute saisie
2. **Formulaire** : Email, nom d'utilisateur, mot de passe, confirmation
3. **Indicateur de force** du mot de passe en temps réel (Faible → Très fort)
4. **Checklist dynamique** des critères :
   - ✅ 8 caractères minimum
   - ✅ 1 majuscule
   - ✅ 1 chiffre
   - ✅ 1 caractère spécial
5. **Validation** : Tous les critères doivent être verts pour activer le bouton

![Inscription](./docs/screens/inscription.png)

#### ✉️ Vérification Email
**Modal post-inscription avec :**
- 7 cases de saisie individuelles avec navigation automatique
- Compte à rebours de 4 minutes (MM:SS)
- Bouton "Renvoyer le code" disponible après expiration
- Modification de l'email possible avant soumission
- Animation d'erreur si code incorrect (cases secouées + vidées)
- Toast de confirmation + ouverture automatique de la connexion après succès

![Vérification Email](./docs/screens/verification-email.png)

#### 🔐 Connexion (`/auth/login`)
- Formulaire Email + Mot de passe
- Bascule de visibilité du mot de passe
- Case "Se souvenir de moi" (persistance de session)
- Redirection automatique selon le rôle après connexion
- Lien "Mot de passe oublié"

![Connexion](./docs/screens/connexion.png)

#### 🔑 Mot de Passe Oublié
**Deux étapes :**

1. **Demande de réinitialisation** : Saisie de l'email uniquement
2. **Changement de mot de passe** :
   - 7 cases de code + nouveau mot de passe + confirmation
   - Timer 2 minutes + countdown de 60s avant renvoi possible
   - Indicateur de force du nouveau mot de passe
   - Redirection vers connexion après succès

---

### 2. Layout Partagé (Tous Profils)

#### 📱 Navbar Responsive
**Éléments principaux :**
- Avatar avec initiales de l'utilisateur connecté
- Panier avec badge compteur (visible uniquement pour les acheteurs)
- Clochette de notifications avec badge
- Menu utilisateur avec déconnexion
- Menu hamburger responsive sur mobile
- Fermeture automatique au clic extérieur

![Navbar Desktop](./docs/screens/navbar-desktop.png)
![Navbar Mobile](./docs/screens/navbar-mobile.png)

#### 🛒 Panneau Panier
**Fonctionnalités :**
- Liste détaillée des articles (image, nom, attributs, prix effectif, quantité, sous-total)
- Mode édition : boutons +/- et suppression par article
- Total général calculé en temps réel
- Bouton "Commander" ouvrant la modal de confirmation

![Panier](./docs/screens/panier.png)

#### ✅ Modal Confirmation de Commande (2 étapes)
**Étape 1 : Récapitulatif**
- Liste des articles, quantités, prix, total

**Étape 2 : Validation**
- Saisie du mot de passe pour confirmer l'achat
- Erreur affichée si mot de passe incorrect ou stock insuffisant
- Toast de succès + panier vidé automatiquement après validation

![Confirmation Étape 1](./docs/screens/confirmation-1.png)
![Confirmation Étape 2](./docs/screens/confirmation-2.png)

#### 🗂️ Sidebar (Menu Latéral)
**Comportements :**
- Collapsée par défaut, s'étend au survol sur desktop
- Tiroir coulissant sur mobile (via hamburger)
- Menu filtré selon le rôle connecté
- Sous-menus avec flyouts positionnés dynamiquement

![Sidebar Desktop](./docs/screens/sidebar-desktop.png)
![Sidebar Mobile](./docs/screens/sidebar-mobile.png)

#### 🛡️ Sécurité : Guard & Intercepteur
**AuthGuard** : Vérifie la validité du token JWT à chaque navigation, redirige vers `/auth` si invalide

**AuthInterceptor** : Ajoute automatiquement le token JWT dans toutes les requêtes vers les zones protégées (`/admin/`, `/boutique/`, `/acheteur/`)

#### 🔔 Système de Toast
Notifications visuelles en haut de l'écran :
- ✅ Succès (vert)
- ❌ Erreur (rouge)
- ⚠️ Avertissement (orange)
- ℹ️ Info (bleu)

Durée : 5 secondes avec bouton "OK"

---

### 3. Profil Administrateur

#### 📦 Liste des Produits Admin (`/admin/produits/list`)

**Tableau de bord statistique :**
- Total produits
- Produits en stock
- Stock faible (alerte)
- Rupture de stock
- Score santé du catalogue
- Top 5 catégories

**Fonctionnalités :**
- Filtres : recherche texte, statut de stock, catégorie
- Skeleton loading pendant le chargement
- Tableau avec checkboxes (sélection individuelle et globale)
- Pagination intelligente avec ellipsis
- Bouton "Ajouter un produit"

![Admin Produits](./docs/screens/admin-produits.png)

#### ➕ Modal Ajout de Produit

**Champs obligatoires :**
- Nom du produit
- Code produit
- Date de sortie

**Gestion des catégories :**
- Sélecteur de catégorie personnalisé avec suppression inline
- Bouton "Créer une catégorie" ouvrant un modal imbriqué

**Spécifications dynamiques :**
- Ajout de paires clé/valeur
- Édition et confirmation inline
- Suppression des spécifications

![Ajout Produit](./docs/screens/admin-ajout-produit.png)

#### 📂 Modal Création de Catégorie (Imbriqué)

**Champs :**
- Nom de la catégorie (obligatoire)
- Unité de mesure (ex: kg, L, pièces)

**Comportement :**
- Toast de succès
- Rechargement automatique de la liste dans le modal parent
- Sans fermeture du modal produit

![Création Catégorie](./docs/screens/admin-categorie.png)

---

### 4. Profil Boutique

#### 🏷️ Liste des Produits Boutique (`/boutique/products/user`)

**Cartes statistiques (6 indicateurs) :**
1. Nombre de variants
2. Valeur totale du stock
3. Produits en promotion
4. Alertes stock
5. Prix moyen
6. Catégories actives

**Filtres avancés :**
- Recherche textuelle
- Catégories (multi-sélection)
- Fourchette de prix
- Niveau de stock
- Statut (actif/inactif)
- Dates de création/modification
- Statut promotion
- Attributs dynamiques

**Export des données :**
- Export JSON téléchargeable des résultats filtrés

**Tri multi-colonnes :**
- Nom, code, catégorie, date, stock

**Structure arborescente :**
- Produit → Variants → Détails (expand/collapse)
- Badges colorés : type de promotion + valeur
- Statut de stock avec codes couleur

![Boutique Produits](./docs/screens/boutique-produits.png)

#### ➕ Modal Création de Variant

**Recherche de produit :**
- Autocomplétion avec recherche live
- Maximum 10 résultats affichés
- Sélection par clic

**Champs du variant :**
- Code variant
- Prix de vente
- Stock disponible
- Variant principal (booléen)

**Spécifications :**
- Spécifications dynamiques clé/valeur

**Images :**
- Upload multiple d'images
- Prévisualisation immédiate
- Gestion des formats (JPEG, PNG, WebP)

![Création Variant](./docs/screens/boutique-variant.png)

#### 🔄 Modal Mise à Jour de Variant

**Pré-remplissage :**
- Tous les champs pré-remplis avec les données existantes

**Gestion des images :**
- Images existantes affichées avec miniature
- Bouton de marquage pour suppression
- Ajout de nouvelles images en supplément

![Mise à Jour Variant](./docs/screens/boutique-update-variant.png)

#### 🏷️ Modal Création de Promotion

**Types de promotion :**
- **REMISE** : Pourcentage de réduction (ex: -20%)
- **DISCOUNT** : Montant fixe déduit (ex: -5000 Ar)
- **PRICE** : Prix fixe imposé (ex: 15000 Ar)

**Aperçu en temps réel :**
- Calcul instantané du prix résultant
- Affichage de l'économie réalisée

**Modes de durée :**
- **Mode Durée** : Heures / Jours / Mois
- **Mode Dates** : Date de début + Date de fin

**Validation :**
- Dates cohérentes (fin > début)
- Les deux dates obligatoires si une est remplie

![Création Promotion](./docs/screens/boutique-promotion.png)

#### 🔄 Modal Mise à Jour de Promotion

**Synchronisation bidirectionnelle :**
- Changement de la durée → recalcule automatiquement les dates
- Changement des dates → recalcule automatiquement la durée

**Pré-remplissage :**
- Toutes les données existantes pré-remplies
- Historique des modifications

![Mise à Jour Promotion](./docs/screens/boutique-update-promo.png)

---

### 5. Profil Acheteur

#### 🛍️ Catalogue Produits (`/acheteur/products/recommanded`)

**Recherche globale :**
- Délai de 300ms pour optimiser les performances
- Recherche sur : nom, catégorie, code, attributs

**Filtres disponibles :**
- Catégorie
- Fourchette de prix (min/max)
- En stock seulement
- En promotion seulement
- Attributs spécifiques

**Indicateurs :**
- Compteur de filtres actifs

**Préréglages de tri :**
- Meilleure correspondance
- Meilleures ventes
- Prix croissant/décroissant

**Cards produit :**
- Image principale
- Badge de promotion (type + valeur)
- Prix barré + nouveau prix
- Compte à rebours de fin de promotion
- Statut de stock coloré (Vert: En stock, Orange: Stock faible, Rouge: Rupture)
- Attributs principaux

**Gestion des quantités :**
- Ajustement avec validateurs
- Validation contre le stock disponible réel
- Bouton "Ajouter au panier" désactivé si rupture ou quantité invalide

**Interactions :**
- Confirmation avant ajout au panier
- Toast de succès après ajout

![Catalogue Acheteur](./docs/screens/acheteur-catalogue.png)

---

## 📚 Guides Utilisateurs

### Pour les Administrateurs

1. **Créer un produit de référence**
   - Accédez à `/admin/produits/list`
   - Cliquez sur "Ajouter un produit"
   - Remplissez les informations de base
   - Créez ou sélectionnez une catégorie
   - Ajoutez les spécifications techniques
   - Validez

2. **Gérer les catégories**
   - Depuis le modal d'ajout de produit
   - Cliquez sur "Créer une catégorie"
   - Définissez le nom et l'unité de mesure
   - La catégorie est immédiatement disponible

### Pour les Boutiques

1. **Ajouter un variant à un produit**
   - Accédez à `/boutique/products/user`
   - Cliquez sur "Créer un variant"
   - Recherchez et sélectionnez le produit de référence
   - Définissez votre prix, stock et code
   - Ajoutez vos images
   - Validez

2. **Créer une promotion**
   - Depuis la liste des produits
   - Sélectionnez un variant
   - Cliquez sur "Créer une promotion"
   - Choisissez le type (REMISE, DISCOUNT, PRICE)
   - Définissez la durée ou les dates
   - Consultez l'aperçu du prix
   - Validez

### Pour les Acheteurs

1. **Parcourir les produits**
   - Accédez à `/acheteur/products/recommanded`
   - Utilisez la recherche et les filtres
   - Triez selon vos critères

2. **Passer une commande**
   - Ajoutez des produits au panier
   - Ajustez les quantités
   - Ouvrez le panneau du panier
   - Cliquez sur "Commander"
   - Confirmez avec votre mot de passe
   - Recevez la confirmation

---

## 🔌 API & Endpoints

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription d'un nouvel utilisateur |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/verify-email` | Vérification du code email |
| POST | `/api/auth/forgot-password` | Demande de réinitialisation |
| POST | `/api/auth/reset-password` | Réinitialisation du mot de passe |
| GET | `/api/auth/me` | Récupération du profil connecté |

### Administration

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/produits` | Liste des produits |
| POST | `/api/admin/produits` | Création de produit |
| PUT | `/api/admin/produits/:id` | Mise à jour de produit |
| DELETE | `/api/admin/produits/:id` | Suppression de produit |
| POST | `/api/admin/categories` | Création de catégorie |
| GET | `/api/admin/categories` | Liste des catégories |

### Boutique

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/boutique/variants` | Liste des variants |
| POST | `/api/boutique/variants` | Création de variant |
| PUT | `/api/boutique/variants/:id` | Mise à jour de variant |
| POST | `/api/boutique/promotions` | Création de promotion |
| PUT | `/api/boutique/promotions/:id` | Mise à jour de promotion |

### Acheteur

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/acheteur/products` | Catalogue des produits |
| POST | `/api/acheteur/panier` | Gestion du panier |
| PUT | `/api/acheteur/panier/:itemId` | Mise à jour quantité |
| DELETE | `/api/acheteur/panier/:itemId` | Suppression article |
| POST | `/api/acheteur/commande` | Validation commande |

---

## 🌍 Déploiement

### Environment Variables (Production)

**Backend `.env.production` :**

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://user:password@host:27017/commercialiseo
JWT_SECRET=<SECRET_TRES_FORT>
FRONTEND_URL=https://commercialiseo.com
EMAIL_HOST=smtp.votredomaine.com
```

**Frontend `environment.prod.ts` :**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.commercialiseo.com/api',
  vitrineUrl: 'https://commercialiseo.com/auth/vitrine'
};
```

### Build de Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

### Docker Production

```bash
# Build optimisé
docker-compose -f docker-compose.prod.yml build

# Déploiement
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔗 Liens Utiles

### 🌐 Démos en Ligne

- **Site Principal** : [https://commercialiseo.com](https://commercialiseo.com)
- **Démo Admin** : [https://demo-admin.commercialiseo.com](https://demo-admin.commercialiseo.com)
- **Démo Boutique** : [https://demo-boutique.commercialiseo.com](https://demo-boutique.commercialiseo.com)
- **Démo Acheteur** : [https://demo-acheteur.commercialiseo.com](https://demo-acheteur.commercialiseo.com)

### 📄 Documentation Complète

- **Documentation API** : [https://docs.commercialiseo.com/api](https://docs.commercialiseo.com/api)
- **Guides Utilisateurs** : [https://docs.commercialiseo.com/guides](https://docs.commercialiseo.com/guides)
- **Schémas de Base de Données** : [https://docs.commercialiseo.com/db-schema](https://docs.commercialiseo.com/db-schema)

### 💻 Dépôts de Code

- **Backend** : [https://github.com/GekidoCoding/commercialiseo_backend](https://github.com/GekidoCoding/commercialiseo_backend)
- **Frontend** : [https://github.com/GekidoCoding/commercialiseo_frontend](https://github.com/GekidoCoding/commercialiseo_frontend)

---

## 🤝 Contribuer

Nous accueillons les contributions ! Voici comment participer :

### Étapes de Contribution

1. **Forkez** le dépôt
2. **Clonez** votre fork : `git clone https://github.com/votre-pseudo/commercialiseo.git`
3. **Créez** une branche : `git checkout -b feature/nouvelle-fonctionnalite`
4. **Codez** vos changements
5. **Testez** rigoureusement
6. **Committez** : `git commit -m 'Ajout: nouvelle fonctionnalité'`
7. **Push** : `git push origin feature/nouvelle-fonctionnalite`
8. **Pull Request** sur GitHub

### Standards de Code

- Respectez les conventions ESLint et Prettier
- Commentez le code complexe
- Écrivez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation

---

## 📝 Licence

Ce projet est sous licence **ISC** - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👥 Équipe & Contact

**Commercialiseo Team**

- 📧 Email : contact@commercialiseo.com
- 📱 Téléphone : +261 XX XX XXX XX
- 📍 Adresse : Antananarivo, Madagascar

### Contributeurs Principaux

<div align="center">
  <table>
    <tr>
      <td align="center">
        <strong>Développeurs Full-Stack</strong><br>
        Angular • Node.js • MongoDB
      </td>
    </tr>
  </table>
</div>

---

## 📊 Statistiques du Projet

<div align="center">

| Metric | Valeur |
|--------|--------|
| **Version Actuelle** | 2.0.0 |
| **Langues** | Français, Anglais |
| **Taille du Code** | ~50,000 lignes |
| **Nombre de Tests** | 150+ |
| **Couverture de Tests** | 85% |

</div>

---

<div align="center">

**Merci d'utiliser Commercialiseo !** 🎉

[Faire un retour](mailto:contact@commercialiseo.com) • [Signaler un bug](https://github.com/GekidoCoding/commercialiseo/issues)

</div>
