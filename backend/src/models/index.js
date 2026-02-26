// models/index.js
module.exports = {
    // Write Models
    User: require('./write/users'),
    VerificationCode: require('./write/verificationcode'),
    Category: require('./write/category'),
    Product: require('./write/product'),
    Variant: require('./write/variant'),
    Promotion: require('./write/promotion'),
    HistoProduct: require('./write/histo_product'),
    CategoryNotification: require('./write/category_notification'),
    PushNotification: require('./write/push_notification'),

    // Read Models
    PromotionRead: require('./read/promotion_read'),
    VariantRead: require('./read/variant_read'),
    ProductRead: require('./read/product_read'),
};

