const express = require("express");

const {
  getPublicPackages,
} = require("../controllers/packageController");

const router = express.Router();

router.get(
  "/public/:slug",
  getPublicPackages
);

module.exports = router;