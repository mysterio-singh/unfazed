const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const clientAuthMiddleware = require("../middleware/clientAuthMiddleware");

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  getClientSessions,
  getClientPortalProfile,
} = require("../controllers/clientController");

const router = express.Router();

// Therapist routes
router.post(
  "/",
  authMiddleware,
  createClient
);

router.get(
  "/",
  authMiddleware,
  getClients
);

router.get(
  "/:id",
  authMiddleware,
  getClientById
);

router.put(
  "/:id",
  authMiddleware,
  updateClient
);

router.get(
  "/portal/profile",
  clientAuthMiddleware,
  getClientPortalProfile
);
// Client Portal
router.get(
  "/portal/sessions",
  clientAuthMiddleware,
  getClientSessions
);



module.exports = router;