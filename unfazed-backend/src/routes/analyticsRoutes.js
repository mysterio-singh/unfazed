const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const entitlementMiddleware = require("../middleware/entitlementMiddleware");

const {
  getAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  entitlementMiddleware("analyticsBasic"),
  getAnalytics
);

module.exports = router;