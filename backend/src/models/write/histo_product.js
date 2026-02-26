const mongoose = require('mongoose');

const histoProductSchema = new mongoose.Schema(
    {
        action: {
            type: String,
        },
        variant: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        date: {
            type: Date,
        },
        product: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        quantity: {
            type: Number,
        },
        stockBefore: {
            type: Number,
        },
        stockAfter: {
            type: Number,
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('HistoProduct', histoProductSchema);