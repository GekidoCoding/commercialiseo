const mongoose = require('mongoose');

const productReadSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        variants: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        product: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('ProductRead', productReadSchema);