const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createLeadController,
  getLeadsController,
  updateLeadStatusController,
} = require("../controllers/leadController");

const router = express.Router();

// Create a new lead
router.post(
  "/",
  authMiddleware,
  createLeadController
);

// Get therapist's leads
router.get(
  "/",
  authMiddleware,
  getLeadsController
);

// Update lead status
router.patch(
  "/:leadId/status",
  authMiddleware,
  updateLeadStatusController
);

module.exports = router;