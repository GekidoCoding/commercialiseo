const mongoose = require('mongoose');

const variantReadSchema = new mongoose.Schema(
    {
        code: {
            type: String,
        },
        stock: {
            type: Number,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        price: {
            type: Number,
        },
        specificAttributes: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        lastUpdated: {
            type: Date,
        },
        promotions: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        isMain: {
            type: Boolean,
            default: false,
        },

        images: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('VariantRead', variantReadSchema);