const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Register User
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Get Logged-in User Profile
router.get("/profile", authMiddleware, getProfile);

// Update Logged-in User Profile
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;