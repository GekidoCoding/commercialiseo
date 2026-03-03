/**
 * Middleware pour l'upload de fichiers photos
 * Images automatiquement redimensionnées et optimisées pour les cards e-commerce
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// S'assurer que le dossier photos existe
const uploadDir = path.join(__dirname, '../../images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const CARD_CONFIG = {
    width: 800,        // largeur en px (ratio 4:3 classique pour e-commerce)
    height: 600,       // hauteur en px
    fit: 'cover',      // remplissage complet sans déformation (recadrage centré)
    background: { r: 255, g: 255, b: 255, alpha: 1 }, // fond blanc pour les images transparentes
    quality: 85,       // qualité JPEG/WebP (bon équilibre taille/qualité)
    format: 'webp',    // WebP : meilleure compression, supporté par tous les navigateurs modernes
};
// ──────────────────────────────────────────────────────────────────────────────

// Stockage temporaire en mémoire (sharp traitera avant sauvegarde)
const storage = multer.memoryStorage();

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Seuls JPEG, PNG et WEBP sont acceptés.'), false);
    }
};

// Configuration de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max en entrée (sharp compressera à ~200-400KB)
        files: 10                    // Maximum 10 fichiers
    }
});

const uploadPhotos = upload.array('images', 10);

/**
 * Redimensionne et optimise une image pour l'affichage en card e-commerce.
 * Toutes les images seront converties en WebP 800x600 (ratio 4:3).
 */
const processImage = async (buffer) => {
    return sharp(buffer)
        .resize(CARD_CONFIG.width, CARD_CONFIG.height, {
            fit: CARD_CONFIG.fit,         // recadrage centré, remplit tout le cadre
            position: 'centre',           // point de focus au centre
            background: CARD_CONFIG.background,
            withoutEnlargement: false,    // autorise l'agrandissement des petites images
        })
        .flatten({ background: CARD_CONFIG.background }) // gère la transparence PNG
        .webp({ quality: CARD_CONFIG.quality })
        .toBuffer();
};

/**
 * Wrapper principal : upload + traitement sharp + sauvegarde
 */
const handleUpload = (req, res, next) => {
    uploadPhotos(req, res, async (err) => {
        // ── Gestion des erreurs Multer ────────────────────────────────────────
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Fichier trop volumineux. Taille maximale en entrée : 10MB'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Trop de fichiers. Maximum 10 fichiers autorisés'
                });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        // ── Traitement sharp pour chaque fichier uploadé ──────────────────────
        if (!req.files || req.files.length === 0) {
            return next();
        }

        try {
            const processedFiles = await Promise.all(
                req.files.map(async (file) => {
                    const processedBuffer = await processImage(file.buffer);

                    // Nom de fichier unique en .webp
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const filename = `${uniqueSuffix}.webp`;
                    const filepath = path.join(uploadDir, filename);

                    // Sauvegarde sur disque
                    await fs.promises.writeFile(filepath, processedBuffer);

                    // Met à jour les métadonnées du fichier pour les middlewares suivants
                    return {
                        ...file,
                        filename,
                        path: filepath,
                        size: processedBuffer.length,
                        mimetype: 'image/webp',
                        buffer: undefined, // libère la mémoire
                    };
                })
            );

            req.files = processedFiles;
            next();
        } catch (processingError) {
            console.error('Erreur traitement image:', processingError);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors du traitement des images.'
            });
        }
    });
};

module.exports = {
    upload,
    uploadPhotos,
    handleUpload,
};