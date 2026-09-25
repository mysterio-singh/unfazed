const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getPublicProfile,
} = require("../controllers/therapistController");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

router.put("/profile", authMiddleware, updateProfile);

router.get("/public/:slug", getPublicProfile);

module.exports = router;