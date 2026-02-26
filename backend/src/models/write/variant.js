const mongoose = require('mongoose');
const {array} = require("joi");

const variantSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            trim: true,
        },
        stock: {
            type: Number,
        },
        userId: {
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
        images: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        isMain: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('Variant', variantSchema);