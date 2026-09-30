const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createNote,
  getTherapistNotes,
} = require("../controllers/noteController");

const router = express.Router();

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

module.exports = router;