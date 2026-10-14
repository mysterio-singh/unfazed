const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile,
  getPublicProfile,
  getPublicTherapists,
} = require("../controllers/therapistController");


const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.get("/public/therapists", getPublicTherapists);

router.put("/profile", authMiddleware, updateProfile);
router.get("/public", getPublicTherapists);

router.get("/public/:slug", getPublicProfile);

module.exports = router;