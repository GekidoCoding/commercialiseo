const mongoose = require('mongoose');
const TYPE_PROMOTION = require('../../constants/type_promotion');
const promotionSchema = new mongoose.Schema(
    {
        value: {
            type: Number,
            required: true,
        },
        typePromotion: {
            type: String,
            enum: {
                values: Object.values(TYPE_PROMOTION),
                message: 'Type de promotion {VALUE} non supporté',
            },
            default: TYPE_PROMOTION.PRICE,
        },
        dateBegin: {
            type: Date,
            required: true,
        },
        // en heure (obligatoire )
        duration: {
            type: Number,
            required: true,
        },
        dateEnd: {
            type: Date,
            required: true,
        },

        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variant',
        },
    },
    { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('Promotion', promotionSchema);