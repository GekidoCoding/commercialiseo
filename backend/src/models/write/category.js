const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {

        name: {
            type: String,
            unique: true,
            required: [true, 'Le nom est requis'],
            trim: true,
        },
        unity: {
            type: String,
            trim: true,
        },

    },
    { timestamps: false }
);

module.exports = mongoose.model('Category', categorySchema);