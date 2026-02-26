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
        categoryNotifId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CategoryNotification',
        },
    },
    { timestamps: false }
);

module.exports = mongoose.model('PushNotifications', pushNotificationsSchema);