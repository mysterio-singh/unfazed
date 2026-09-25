const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
} = require("../controllers/clientController");

const router = express.Router();

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

router.put("/:id", authMiddleware, updateClient);

module.exports = router;