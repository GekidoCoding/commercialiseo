const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Le nom est requis'],
            trim: true,
        },
        categoryId: {
            type: String,
        },
        code: {
            type: String,
            trim: true,
        },
        specs: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        releaseDate: {
            type: Date,
        },

    },
    { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('Product', productSchema);