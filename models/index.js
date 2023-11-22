const mongoose = require("mongoose");

const UserSchema = require("./user");
const smartWatchSchema = require("./smartWatch");
const otpSchema = require("./otp");
const productSchema = require("./product");
const aboutUsSchema = require("./aboutUs");
const searchSchema = require("./search");
const fitnessLevelSchema = require("./fitnessLevel");
const reportSchema = require("./report");
const privacyPolicySchema = require("./privacyPolicy");
const termsOfUseSchema = require("./termsOfUse");
const AdminSchema = require("./admin");
const subscriptionPlansSchema = require("./subscriptionPlans");
const sagaSchema = require("./saga");
const ratingSchema = require("./rating");
const favouriteSchema = require("./favourite");
const categorySchema = require("./category");
const voiceSchema = require("./voices");
const transactionsSchema = require("./transactions");
const notification = require("./notifications");
const runs = require("./runs")


const User = mongoose.model("User", UserSchema);
const SmartWatch = mongoose.model("SmartWatch", smartWatchSchema);
const OTP = mongoose.model("OTP", otpSchema);
const AboutUs = mongoose.model("AboutUs", aboutUsSchema);
const Search = mongoose.model("Search", searchSchema);
const Product = mongoose.model("Product", productSchema);
const FitnessLevel = mongoose.model("FitnessLevel", fitnessLevelSchema);
const Report = mongoose.model("Report", reportSchema);
const PrivacyPolicy = mongoose.model("PrivacyPolicy", privacyPolicySchema);
const TermsOfUse = mongoose.model("TermsOfUse", termsOfUseSchema);
const Admin = mongoose.model("Admin", AdminSchema);
const SubscriptionPlans = mongoose.model("SubscriptionPlans", subscriptionPlansSchema);
const Saga = mongoose.model("SagaSchema", sagaSchema);
const Rating = mongoose.model("RatingSchema", ratingSchema);
const Favourite = mongoose.model("FavouriteSchema", favouriteSchema);
const Category = mongoose.model("Category", categorySchema);
const Voice = mongoose.model("Voice", voiceSchema);
const Transactions = mongoose.model("Transactions", transactionsSchema);
const Notification = mongoose.model("notification", notification);
const Runs = mongoose.model("Runs", runs);


module.exports = {
  User,
  SmartWatch,
  OTP,
  Product,
  AboutUs,
  Search,
  FitnessLevel,
  Report,
  PrivacyPolicy,
  TermsOfUse,
  Admin,
  SubscriptionPlans,
  Saga,
  Rating,
  Favourite,
  Category,
  Voice,
  Transactions,
  Notification,
  Runs
};
