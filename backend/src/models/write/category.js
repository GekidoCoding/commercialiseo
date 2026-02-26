const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Le nom est requis'],
            trim: true,
        },
        allowedAttributes: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        attributesValues: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        unity: {
            type: String,
            trim: true,
        },

    },
    { timestamps: false }
);

module.exports = mongoose.model('Category', categorySchema);