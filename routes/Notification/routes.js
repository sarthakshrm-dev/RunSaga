const status = require("http-status");
const { Notification, User } = require("../../models");

const getAllNotification = async (req, res) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        // Parse pagination parameters from the request query
        const page = parseInt(req.body.page) || 1;  // Page number
        const perPage = parseInt(req.body.perPage) || 1;  // Number of notifications per page

        // Calculate the number of notifications to skip based on page and perPage
        const skip = (page - 1) * perPage;

        const notifications = await Notification
            .find({ activityOwner: req.id })
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(perPage);

        if (!notifications || notifications.length === 0) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Notifications found" });
        }

        res.status(status.OK).json({ Status: true, data: notifications, message: "Notification Retrieved" });

        const result = await Notification.updateMany(
            { activityOwner: req.id, isRead: false },
            { $set: { isRead: true } }
        );
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};



const saveNotification = async (req, res, notification) => {
    try {
        if (!req.id) {
            return res.status(status.UNAUTHORIZED).json({ Status: false, error: "User is not authorized" });
        }

        let data;
        if (notification.userId != "All") {
            const addNew = {
                activityOwner: notification.userId,
                activityId: notification.activityId,
                activityType: notification.type,
                title: notification.title,
                description: notification.description
            };

            data = await Notification.create(addNew);
        } else {
            const allUsers = await User.find({}, '_id');

            const notifications = allUsers.map((user) => ({
                activityOwner: user._id,
                activityId: notification.activityId,
                activityType: notification.type,
                title: notification.title,
                description: notification.description
            }));

            // Use bulk insert to create notifications for all users
            data = await Notification.insertMany(notifications);
        }

        if (!data) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Notifications found" });
        }

        return true;
    } catch (error) {
        return false;
    }
};

module.exports = {
    getAllNotification,
    saveNotification
}

