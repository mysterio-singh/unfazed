const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const entitlementMiddleware = require("../middleware/entitlementMiddleware");

const {
  getAnalytics,
  getDashboardStats,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  entitlementMiddleware("analyticsBasic"),
  getAnalytics
);
router.get(
  "/dashboard",
  authMiddleware,
  entitlementMiddleware("analyticsBasic"),
  getDashboardStats
);

module.exports = router;