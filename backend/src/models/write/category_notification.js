const mongoose = require('mongoose');

const categoryNotificationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('CategoryNotification', categoryNotificationSchema);
