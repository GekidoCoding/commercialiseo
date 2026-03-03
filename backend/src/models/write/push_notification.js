const mongoose = require('mongoose');

const pushNotificationsSchema = new mongoose.Schema(
    {
        message: {
            type: String,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        category: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },

    },
    { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('PushNotifications', pushNotificationsSchema);