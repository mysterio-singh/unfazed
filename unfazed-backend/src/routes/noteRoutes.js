const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const clientAuthMiddleware = require("../middleware/clientAuthMiddleware");

const {
  createNote,
  getTherapistNotes,
  getClientSharedNotes,
} = require("../controllers/noteController");

const router = express.Router();

// Therapist routes
router.post(
  "/",
  authMiddleware,
  createNote
);

router.get(
  "/",
  authMiddleware,
  getTherapistNotes
);

// Client route — shared notes only
router.get(
  "/client/shared",
  clientAuthMiddleware,
  getClientSharedNotes
);

module.exports = router;