const mongoose = require('mongoose');
const {ROLES} = require("../../constants/roles");
const TYPE_PROMOTION = require("../../constants/type_promotion");

const promotionReadSchema = new mongoose.Schema(
    {
        value: {
            type: Number,
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
        },
        dateEnd: {
            type: Date,
        },

    },
    { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('PromotionRead', promotionReadSchema);