const express = require("express");

const {
  registerTherapist,
  loginTherapist,
  validateRegistration,
  validateLogin,
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  validateRegistration,
  registerTherapist
);

router.post(
  "/login",
  validateLogin,
  loginTherapist
);

module.exports = router;