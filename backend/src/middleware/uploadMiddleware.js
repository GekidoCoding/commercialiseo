/**
 * Middleware pour l'upload de fichiers photos
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// S'assurer que le dossier photos existe
const uploadDir = path.join(__dirname, '../../photos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

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
        fileSize: 5 * 1024 * 1024, // 5MB max par fichier
        files: 10 // Maximum 10 fichiers
    }
});

// Middleware pour upload multiple de photos
const uploadPhotos = upload.array('photos', 10);

// Wrapper pour gérer les erreurs multer
const handleUpload = (req, res, next) => {
    uploadPhotos(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Erreur multer spécifique
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Fichier trop volumineux. Taille maximale: 5MB'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Trop de fichiers. Maximum 10 fichiers autorisés'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        } else if (err) {
            // Autre erreur
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

module.exports = {
    upload,
    uploadPhotos,
    handleUpload
};
