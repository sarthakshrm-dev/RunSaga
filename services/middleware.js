const jwt = require("jsonwebtoken");
const { User } = require("../models");


exports.jwtDecoder = async (req, res, next) => {
  try {
    const Bearer = req.headers.authorization;

    if (!Bearer || !Bearer.startsWith("Bearer ")) {
      return res.status(401).json({
        status: 401,
        error: "Please provide a valid bearer token in the Authorization header.",
      });
    }

    const token = Bearer.replace("Bearer ", "");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.id = decoded.userId;
      req.user = await User.findById(decoded.userId);
      req.token = token;
      next();
    } catch (err) {
      return res.status(401).json({
        status: 401,
        error: "Invalid token",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
    });
  }
};
