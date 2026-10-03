const express = require("express");

const {
  getChatHistory,
  getTherapistChatHistory,
} = require("../controllers/chatController");

const clientAuthMiddleware = require("../middleware/clientAuthMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Client chat history
router.get(
  "/history",
  clientAuthMiddleware,
  getChatHistory
);

// Therapist chat history for a specific client
router.get(
  "/therapist/history/:clientId",
  authMiddleware,
  getTherapistChatHistory
);

module.exports = router;