const status = require("http-status");
const { SubscriptionPlans } = require("../../models");

const createSubscription = async (req, res) => {
    try {
        const { name, price, description, type, features } = req.body;

        if (!price || typeof subscriptionData.price != "number") {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Price should be an integer" });
        }

        if (!name) {
            return res.status(status.BAD_REQUEST).json({ Status: false, error: "Name is required" });
        }

        const subscriptionData = {
            name,
            price,
            description,
            type,
            features
        };

        const subscription = await SubscriptionPlans.create(subscriptionData);
        res.status(status.CREATED).json({ Status: true, data: subscription, message: "New subscription plan is created" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await SubscriptionPlans.find({}).sort({ updatedAt: -1 });
        if (!subscriptions) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "No Subscription Plans found" });
        }
        res.status(status.OK).json(subscriptions);
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};

const updateSubscription = async (req, res) => {
    try {
        const id = req.params.id;
        const subscriptionData = req.body;

        if (subscriptionData.price) {
            if (typeof subscriptionData.price != "number") {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Price should be an integer" });
            }
        }

        if (subscriptionData.features) {
            if (typeof subscriptionData.features != "object") {
                return res.status(status.NOT_FOUND).json({ Status: false, error: "Feature should be an array" });
            }
        }


        const existingData = await SubscriptionPlans.findByIdAndUpdate(
            id,
            subscriptionData,
            { new: true } // This option returns the updated document
        );


        if (!existingData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Subscription Plan not found" });
        }
        res.status(200).json({ Status: true, message: "Subscription plan is updated" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};


const deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedData = await SubscriptionPlans.findByIdAndDelete(id);

        if (!deletedData) {
            return res.status(status.NOT_FOUND).json({ Status: false, error: "Subscription Plan not found" });
        }

        res.status(200).json({ Status: true, message: "Subscription plan is deleted" });
    } catch (error) {
        res.status(status.INTERNAL_SERVER_ERROR).json({ Status: false, error: error.message });
    }
};


module.exports = {
    createSubscription,
    getAllSubscriptions,
    updateSubscription,
    deleteSubscription,
};
