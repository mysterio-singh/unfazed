const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAvailability,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  createBooking,
  getTherapistSessions,
  getPublicAvailability,
  completeSession,
} = require("../controllers/schedulingController");

const router = express.Router();

router.get(
  "/availability",
  authMiddleware,
  getAvailability
);

router.post(
  "/availability",
  authMiddleware,
  createAvailability
);

router.put(
  "/availability/:id",
  authMiddleware,
  updateAvailability
);

router.patch("/sessions/:sessionId/complete", authMiddleware, completeSession);

router.delete(
  "/availability/:id",
  authMiddleware,
  deleteAvailability
);

router.post(
  "/book",
  authMiddleware,
  createBooking
);

router.get(
  "/sessions",
  authMiddleware,
  getTherapistSessions
);


router.get(
  "/public/:slug/availability",
  getPublicAvailability
);

module.exports = router;