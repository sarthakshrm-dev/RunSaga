const express = require("express");
const { jwtDecoder } = require("../services/middleware");
const api = express.Router();

const authRoutes = require("./auth");
const userChaseMode = require("./chaseMode");
const userWearable = require("./wearable");
const aboutUs = require("./aboutUs");
const privacyPolicy = require("./privacyPolicy");
const termsOfUse = require("./termsOfUse");
const subscriptionPlans = require("./subscriptionPlans");
const admin = require("./admin");
const profile = require("./Profile");
const saga = require("./saga");
const search = require("./search");
const rating = require("./rating");
const favourite = require("./Favourite");
const report = require("./report");
const category = require("./category");
const voices = require("./voices");
const fitnessLevel = require("./fitnessLevel");
const transactions = require("./Transactions");
const notification = require("./Notification");
const runs = require("./runs")



api.use("/auth", authRoutes);
api.use("/chaseMode", jwtDecoder, userChaseMode);
api.use("/wearable", jwtDecoder, userWearable);
api.use("/aboutUs", aboutUs);
api.use("/privacyPolicy", privacyPolicy);
api.use("/termsOfUse", termsOfUse);
api.use("/subscriptionPlans", jwtDecoder, subscriptionPlans);
api.use("/admin", admin);
api.use("/profile", jwtDecoder, profile);
api.use("/saga", jwtDecoder, saga);
api.use("/search", jwtDecoder, search);
api.use("/rating", jwtDecoder, rating);
api.use("/report", jwtDecoder, report);
api.use("/favourite", jwtDecoder, favourite);
api.use("/category", jwtDecoder, category);
api.use("/voices", jwtDecoder, voices);
api.use("/fitnessLevel", jwtDecoder, fitnessLevel);
api.use("/transactions", jwtDecoder, transactions);
api.use("/notification", jwtDecoder, notification);
api.use("/runs", jwtDecoder, runs);


module.exports = api;
